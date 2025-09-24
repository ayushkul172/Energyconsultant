const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 
                event.headers['x-real-ip'] || 
                'unknown';

    const trackingData = JSON.parse(event.body);
    let location = { ip };
    
    if (ip !== 'unknown') {
      try {
        const geoData = await new Promise((resolve, reject) => {
          https.get(`https://ipapi.co/${ip}/json/`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            });
          }).on('error', reject);
        });

        location = {
          ip: geoData.ip,
          city: geoData.city,
          country: geoData.country_name,
          region: geoData.region,
          isp: geoData.org
        };
      } catch (error) {
        console.error('Geo lookup failed:', error.message);
      }
    }

    const fullData = {
      ...trackingData,
      location,
      server_timestamp: new Date().toISOString()
    };

    console.log('📊 Visitor tracked:', JSON.stringify(fullData, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        ip: location.ip,
        location: location.city ? `${location.city}, ${location.country}` : 'Unknown'
      })
    };

  } catch (error) {
    console.error('Tracking error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
