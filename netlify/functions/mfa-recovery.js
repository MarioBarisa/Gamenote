const { createClient } = require('@supabase/supabase-js');
const { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } = require('node:crypto');
const { deflateRawSync, inflateRawSync } = require('node:zlib');

const table = 'mfa_recovery_codes';
const count = 10;
const bytesPerCode = 16;

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}

function seal(codes, key, userId, factorId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`${userId}:${factorId}`));
  const data = Buffer.concat([cipher.update(deflateRawSync(Buffer.concat(codes))), cipher.final()]);
  return '\\x' + Buffer.concat([iv, cipher.getAuthTag(), data]).toString('hex');
}

function unseal(payload, key, userId, factorId) {
  const packed = Buffer.from(payload.slice(2), 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, packed.subarray(0, 12));
  decipher.setAAD(Buffer.from(`${userId}:${factorId}`));
  decipher.setAuthTag(packed.subarray(12, 28));
  const decoded = inflateRawSync(Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]),
    { maxOutputLength: count * bytesPerCode });
  const codes = [];
  for (let offset = 0; offset < decoded.length; offset += bytesPerCode) {
    codes.push(decoded.subarray(offset, offset + bytesPerCode));
  }
  return codes;
}

function createHandler(env = process.env, connect = createClient) {
  let reportedConfigurationError = false;
  return async event => {
    if (event.httpMethod !== 'POST') return reply(405, { error: 'method' });
    const jwt = event.headers?.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!jwt) return reply(401, { error: 'session' });
    const { SUPABASE_SERVICE_ROLE_KEY: serviceKey, MFA_RECOVERY_KEY } = env;
    const url = env.SUPABASE_URL?.trim() || env.VITE_SUPABASE_URL?.trim();
    const key = Buffer.from(MFA_RECOVERY_KEY || '', 'base64');
    const invalidVariables = [];
    if (!url) invalidVariables.push('SUPABASE_URL or VITE_SUPABASE_URL');
    if (!serviceKey?.trim()) invalidVariables.push('SUPABASE_SERVICE_ROLE_KEY');
    if (key.length !== 32) invalidVariables.push('MFA_RECOVERY_KEY');
    if (invalidVariables.length) {
      if (!reportedConfigurationError) {
        console.warn('[mfa-recovery] Missing or invalid runtime variables: ' + invalidVariables.join(', '));
        reportedConfigurationError = true;
      }
      return reply(503, { error: 'unavailable' });
    }
    if (!event.body || event.body.length > 1024 || event.isBase64Encoded) return reply(400, { error: 'request' });

    let body;
    try { body = JSON.parse(event.body); } catch { return reply(400, { error: 'request' }); }
    const action = body?.action;
    if (!['status', 'issue', 'recover', 'clear'].includes(action)) return reply(400, { error: 'request' });
    try {
      const client = connect(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await client.auth.getUser(jwt);
      if (error || !data?.user) return reply(401, { error: 'session' });
      const userId = data.user.id;
      const { aal } = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));
      const factors = (data.user.factors || []).filter(factor => factor.factor_type === 'totp' && factor.status === 'verified');

      if (action === 'issue') {
        const factorId = factors.find(factor => factor.id === body.factorId)?.id;
        if (aal !== 'aal2' || !factorId) return reply(403, { error: 'factor' });
        const codes = Array.from({ length: count }, () => randomBytes(bytesPerCode));
        const { error: saveError } = await client.from(table).upsert({
          user_id: userId, factor_id: factorId, payload: seal(codes, key, userId, factorId),
        });
        if (saveError) return reply(503, { error: 'unavailable' });
        return reply(200, { codes: codes.map(code => code.toString('hex').toUpperCase().match(/.{4}/g).join('-')) });
      }

      const { data: stored, error: readError } = await client.from(table)
        .select('factor_id,payload').eq('user_id', userId).maybeSingle();
      if (readError) return reply(503, { error: 'unavailable' });
      const factorId = factors.find(factor => factor.id === stored?.factor_id)?.id;
      if (action === 'status') return reply(200, { hasCodes: Boolean(factorId) });
      if (action === 'clear') {
        if (stored && !factorId && stored.factor_id === body.factorId) {
          const { error: clearError } = await client.from(table).delete().eq('user_id', userId).eq('factor_id', stored.factor_id);
          if (clearError) return reply(503, { error: 'unavailable' });
        }
        return reply(200, { cleared: true });
      }

      const raw = typeof body.code === 'string' ? body.code.replace(/[\s-]/g, '') : '';
      if (aal !== 'aal1' || !factorId || !/^[0-9a-f]{32}$/i.test(raw)) return reply(400, { error: 'code' });
      const supplied = Buffer.from(raw, 'hex');
      const codes = unseal(stored.payload, key, userId, factorId);
      const remaining = codes.filter(code => !timingSafeEqual(code, supplied));
      if (remaining.length === codes.length) return reply(400, { error: 'code' });

      const payload = seal(remaining, key, userId, factorId);
      const { data: used, error: useError } = await client.from(table).update({ payload })
        .eq('user_id', userId).eq('factor_id', factorId).eq('payload', stored.payload).select('user_id').maybeSingle();
      if (useError) return reply(503, { error: 'unavailable' });
      if (!used) return reply(409, { error: 'code' });

      const { error: deleteError } = await client.auth.admin.mfa.deleteFactor({ userId, id: factorId });
      if (deleteError) {
        await client.from(table).update({ payload: stored.payload })
          .eq('user_id', userId).eq('factor_id', factorId).eq('payload', payload);
        return reply(503, { error: 'unavailable' });
      }
      await client.from(table).delete().eq('user_id', userId).eq('factor_id', factorId);
      return reply(200, { recovered: true });
    } catch {
      return reply(503, { error: 'unavailable' });
    }
  };
}

exports.handler = createHandler();
exports.createHandler = createHandler;
