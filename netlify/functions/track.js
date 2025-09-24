const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['client-ip'] || 
                     'unknown';
    
    // Get location data using native https module
    const locationData = await new Promise((resolve) => {
      https.get(`https://ip-api.com/json/${clientIP}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({});
          }
        });
      }).on('error', () => resolve({}));
    });

    const trackingData = {
      ...data,
      ip_address: clientIP,
      location: locationData.city || 'Unknown',
      country: locationData.country || 'Unknown',
      region: locationData.regionName || 'Unknown',
      timezone: locationData.timezone || 'Unknown'
    };

    console.log('📊 Visitor tracked:', JSON.stringify(trackingData, null, 2));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        location: `${locationData.city || 'Unknown'}, ${locationData.country || 'Unknown'}` 
      })
    };
  } catch (error) {
    console.error('Tracking error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Tracking failed', message: error.message })
    };
  }
};
