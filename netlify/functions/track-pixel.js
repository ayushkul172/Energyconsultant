// netlify/functions/track.js
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
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
    // Parse request body
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    // Log the tracking data (in production, you'd store this in a database)
    console.log('Tracking data received:', {
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      data: body
    });

    // For now, just return success
    // In a real implementation, you'd save to a database here
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Tracking data received',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in track function:', error);
    
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
    // Extract query parameters
    const { range = '7d' } = event.queryStringParameters || {};
    
    // Since you don't want a database, return mock data
    // In production, you'd fetch real data from your database
    const mockData = {
      range,
      timestamp: new Date().toISOString(),
      metrics: {
        totalVisits: Math.floor(Math.random() * 1000) + 500,
        uniqueVisitors: Math.floor(Math.random() * 800) + 400,
        dailyAverage: Math.floor(Math.random() * 100) + 50,
        bounceRate: Math.floor(Math.random() * 30) + 40,
        avgSessionDuration: Math.floor(Math.random() * 180) + 60,
        loadTime: (Math.random() * 2 + 1).toFixed(2)
      },
      chartData: generateChartData(range)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockData)
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

function generateChartData(range) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const labels = [];
  const visits = [];
  const uniqueVisitors = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    if (days <= 30) {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    
    visits.push(Math.floor(Math.random() * 50) + 20);
    uniqueVisitors.push(Math.floor(Math.random() * 40) + 15);
  }
  
  return { labels, visits, uniqueVisitors };
}

// netlify/functions/track-pixel.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  try {
    // Extract tracking parameters from query string
    const params = event.queryStringParameters || {};
    
    // Log the tracking pixel request
    console.log('Pixel tracking:', {
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      referer: event.headers['referer'],
      params
    });

    // Return a 1x1 transparent GIF
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return {
      statusCode: 200,
      headers,
      body: transparentGif.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error in track-pixel function:', error);
    
    // Still return the pixel even if there's an error
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return {
      statusCode: 200,
      headers,
      body: transparentGif.toString('base64'),
      isBase64Encoded: true
    };
  }
};
