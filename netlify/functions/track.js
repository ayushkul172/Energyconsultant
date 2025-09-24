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
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 
                event.headers['x-real-ip'] || 
                'unknown';

    const trackingData = JSON.parse(event.body);

    let location = { ip };
    
    if (ip !== 'unknown') {
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const geo = await response.json();
        
        location = {
          ip: geo.ip,
          city: geo.city,
          country: geo.country_name,
          region: geo.region,
          isp: geo.org
        };
      } catch (error) {
        console.error('Geo lookup failed:', error);
      }
    }

    const fullData = {
      ...trackingData,
      location,
      server_timestamp: new Date().toISOString()
    };

    console.log('Visitor tracked:', JSON.stringify(fullData, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        location: location.city ? `${location.city}, ${location.country}` : 'Unknown'
      })
    };

  } catch (error) {
    console.error('Tracking error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
