exports.handler = async (event) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
    const params = event.queryStringParameters || {};
    
    console.log('Pixel track:', { ip, ...params });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      isBase64Encoded: true
    };
  } catch (error) {
    return { statusCode: 500, body: 'Error' };
  }
};
