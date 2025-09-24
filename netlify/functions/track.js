exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    
    // Get location data from IP (using native fetch)
    let locationData = {};
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}`);
      locationData = await geoResponse.json();
    } catch (err) {
      console.error('Location fetch failed:', err);
    }

    const trackingData = {
      ...data,
      ip_address: clientIP,
      location: locationData.city || 'Unknown',
      country: locationData.country || 'Unknown',
      region: locationData.regionName || 'Unknown',
      isp: locationData.isp || 'Unknown',
      timezone: locationData.timezone || 'Unknown'
    };

    console.log('📊 Visitor tracked:', trackingData);

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
