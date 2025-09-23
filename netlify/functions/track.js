// netlify/functions/track.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    // Get visitor information
    const visitorData = {
      timestamp: new Date().toISOString(),
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown',
      referer: event.headers['referer'] || 'Direct',
      page: body.page || '/',
      screenSize: body.screenSize || 'unknown',
      language: body.language || 'unknown',
      timezone: body.timezone || 'unknown'
    };

    // Log the data (in production, save to database)
    console.log('Visitor tracked:', visitorData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Visit tracked successfully',
        timestamp: visitorData.timestamp
      })
    };

  } catch (error) {
    console.error('Error tracking visitor:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// netlify/functions/dashboard.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { type = 'stats' } = event.queryStringParameters || {};
    
    // Return mock data structure that matches your dashboard
    const responseData = {
      stats: {
        totalVisits: Math.floor(Math.random() * 1000) + 500,
        uniqueIPs: Math.floor(Math.random() * 800) + 400,
        todayVisits: Math.floor(Math.random() * 100) + 50,
        monthVisits: Math.floor(Math.random() * 500) + 200
      },
      visitors: generateMockVisitors(),
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('Error in dashboard function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

function generateMockVisitors() {
  const visitors = [];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia'];
  
  for (let i = 0; i < 10; i++) {
    visitors.push({
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      page: '/',
      referrer: 'Direct'
    });
  }
  
  return visitors;
}

// netlify/functions/track-pixel.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  try {
    const params = event.queryStringParameters || {};
    
    console.log('Pixel tracking:', {
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      referer: event.headers['referer'],
      params
    });

    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return {
      statusCode: 200,
      headers,
      body: pixel.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error in track-pixel:', error);
    
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return {
      statusCode: 200,
      headers,
      body: pixel.toString('base64'),
      isBase64Encoded: true
    };
  }
};
