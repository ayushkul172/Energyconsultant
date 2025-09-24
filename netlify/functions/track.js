const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    
    // Get location data from IP
    let locationData = {};
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}`);
      locationData = await geoResponse.json();
    } catch (err) {
      console.error('Location fetch failed:', err);
    }

    // Combine all tracking data
    const trackingData = {
      ...data,
      ip_address: clientIP,
      location: locationData.city || 'Unknown',
      country: locationData.country || 'Unknown',
      region: locationData.regionName || 'Unknown',
      isp: locationData.isp || 'Unknown',
      timezone: locationData.timezone || 'Unknown'
    };

    // Log to console (you can send to analytics service here)
    console.log('📊 Visitor tracked:', trackingData);

    // Return success with location info
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        location: `${locationData.city}, ${locationData.country}` 
      })
    };
  } catch (error) {
    console.error('Tracking error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Tracking failed' })
    };
  }
};
