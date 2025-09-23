// netlify/functions/track.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    // Enhanced visitor data collection
    const visitorData = {
      id: 'V' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'],
      referer: event.headers['referer'] || 'Direct',
      timestamp: new Date().toISOString(),
      page: body.page || '/',
      sessionId: body.sessionId,
      // Add browser/device detection on server side
      browser: detectBrowser(event.headers['user-agent']),
      os: detectOS(event.headers['user-agent']),
      device: detectDevice(event.headers['user-agent']),
      // Geographic data would come from IP lookup service
      location: await getLocationFromIP(event.headers['x-forwarded-for']),
      ...body
    };

    // Store in your preferred storage (file, database, etc.)
    await storeVisitorData(visitorData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        visitorId: visitorData.id,
        timestamp: visitorData.timestamp
      })
    };

  } catch (error) {
    console.error('Error in track function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
