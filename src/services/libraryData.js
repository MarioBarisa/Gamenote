export async function fetchUserRows(database, table, userId, options = {}) {
  if (!userId) throw new Error('Prijavi se za dohvat podataka.');
  const rows = [];
  let expectedCount = null;
  let offset = 0;
  for (;;) {
    options.signal?.throwIfAborted();
    let query = database.from(table).select(options.columns || '*', { count: 'exact' }).eq('user_id', userId);
    if (options.filter) query = options.filter(query);
    query = query.order(options.order || 'id', { ascending: options.ascending ?? true });
    if (options.order && options.order !== 'id') query = query.order('id');
    query = query.range(offset, offset + 999);
    if (options.signal) query = query.abortSignal(options.signal);
    const { data, error, count } = await query;
    if (error) throw error;
    if (count != null) {
      if (expectedCount != null && count !== expectedCount) throw new Error('Podaci su promijenjeni tijekom dohvaćanja. Pokušaj ponovno.');
      expectedCount = count;
    }
    const page = data || [];
    rows.push(...page);
    offset += page.length;
    if (expectedCount != null && rows.length >= expectedCount) break;
    if (!page.length) {
      if (expectedCount != null && rows.length !== expectedCount) throw new Error('Nisu dohvaćeni svi podaci. Pokušaj ponovno.');
      break;
    }
    if (expectedCount == null && page.length < 1000) break;
  }
  return rows;
}
