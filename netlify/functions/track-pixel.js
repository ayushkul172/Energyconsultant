// netlify/functions/track-pixel.js
// Pixel tracking fallback function

const crypto = require('crypto');

// Import or reuse visitor storage (in real implementation, use shared storage)
let visitors = [];

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

function generateSessionId(ipHash, userAgent) {
  const date = new Date().toISOString().split('T')[0];
  const sessionData = `${ipHash}_${userAgent}_${date}`;
  return crypto.createHash('md5').update(sessionData).digest('hex').substring(0, 12);
}

function detectDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'Mobile';
  if (/tablet|ipad/.test(ua)) return 'Tablet';
  return 'Desktop';
}

exports.handler = async (event, context) => {
  try {
    // Get visitor information
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    const ipHash = hashIP(ip);
    const userAgent = event.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    const sessionId = generateSessionId(ipHash, userAgent);
    const deviceType = detectDeviceType(userAgent);
    const country = event.headers['x-country'] || event.headers['cf-ipcountry'] || 'Unknown';
    
    // Get tracking data from query parameters
    const pageUrl = event.queryStringParameters?.page || '/';
    const referrer = event.queryStringParameters?.ref || null;
    
    // Create visitor record
    const visitor = {
      id: crypto.randomUUID(),
      ipHash: ipHash,
      sessionId: sessionId,
      pageUrl: pageUrl,
      referrer: referrer,
      userAgent: userAgent,
      deviceType: deviceType,
      country: country,
      timestamp: timestamp,
      trackingMethod: 'pixel'
    };

    // Store visitor data
    visitors.push(visitor);
    
    // Limit memory usage
    if (visitors.length > 5000) {
      visitors = visitors.slice(-5000);
    }

    // Return 1x1 transparent GIF
    const gifBuffer = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*'
      },
      body: gifBuffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Pixel tracking error:', error);
    
    // Return empty GIF even on error
    const errorGif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      },
      body: errorGif.toString('base64'),
      isBase64Encoded: true
    };
  }
};
