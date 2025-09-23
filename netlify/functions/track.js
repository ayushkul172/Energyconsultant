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
