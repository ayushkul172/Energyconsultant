const https = require('https');

function getLocationData(ip) {
  return new Promise((resolve) => {
    if (ip === 'unknown' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      resolve({ city: 'Local Network', country: 'N/A', regionName: 'N/A', timezone: 'N/A' });
      return;
    }

    https.get(`https://ip-api.com/json/${ip}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ city: 'Unknown', country: 'Unknown', regionName: 'Unknown', timezone: 'Unknown' });
        }
      });
    }).on('error', () => {
      resolve({ city: 'Unknown', country: 'Unknown', regionName: 'Unknown', timezone: 'Unknown' });
    });
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    
    // Get location info
    const location = await getLocationData(ip);
    
    const trackingData = {
      ...data,
      ip_address: ip,
      location: location.city || 'Unknown',
      country: location.country || 'Unknown',
      region: location.regionName || 'Unknown',
      timezone: location.timezone || 'Unknown',
      timestamp: new Date().toISOString()
    };

    console.log('Visitor tracked:', JSON.stringify(trackingData, null, 2));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true,
        location: `${location.city}, ${location.country}`
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
