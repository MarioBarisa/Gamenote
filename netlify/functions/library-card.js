const { libraryCard } = require('./lib/_libraryCard.js');
exports.handler = async event => {
  const result = await libraryCard(event.httpMethod, event.queryStringParameters?.username, { metadata: event.queryStringParameters?.format === 'metadata', ip: event.headers?.['x-nf-client-connection-ip'] || 'unknown' });
  return { statusCode: result.status, headers: result.headers, body: result.body, isBase64Encoded: result.binary || false };
};
