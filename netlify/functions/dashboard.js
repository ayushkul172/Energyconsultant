// netlify/functions/get-analytics.js
// Server-side function to retrieve and aggregate analytics data

exports.handler = async (event, context) => {
  // Allow GET and OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get query parameters
    const { range = '7d' } = event.queryStringParameters || {};

    // TODO: Fetch from your database
    // For now, we'll return mock data with location info
    
    // In production, you would query your database like:
    // const data = await db.collection('analytics').find({
    //   timestamp: { $gte: getDateRange(range) }
    // }).toArray();

    // Mock aggregated analytics data
    const analyticsData = {
      pageviews: 1247,
      visitors: 856,
      avgDuration: 124,
      bounceRate: 0.38,
      pageviewsChange: 0.12,
      visitorsChange: 0.08,
      durationChange: 0.05,
      bounceChange: -0.02,
      
      activity: [
        { 
          time: new Date().toLocaleTimeString(), 
          event: 'Page View', 
          page: '/',
          ip: '203.45.67.89',
          location: 'Mumbai, India'
        },
        { 
          time: new Date(Date.now() - 30000).toLocaleTimeString(), 
          event: 'Click', 
          page: '/about',
          ip: '192.168.1.100',
          location: 'New York, USA'
        },
        { 
          time: new Date(Date.now() - 60000).toLocaleTimeString(), 
          event: 'Page View', 
          page: '/services',
          ip: '185.23.45.67',
          location: 'London, UK'
        }
      ],
      
      geographic: [
        { 
          country: '🇺🇸 United States', 
          city: 'New York', 
          visitors: 245, 
          uniqueIPs: 189,
          percentage: 28.6 
        },
        { 
          country: '🇮🇳 India', 
          city: 'Mumbai', 
          visitors: 198, 
          uniqueIPs: 156,
          percentage: 23.1 
        },
        { 
          country: '🇬🇧 United Kingdom', 
          city: 'London', 
          visitors: 134, 
          uniqueIPs: 98,
          percentage: 15.6 
        },
        { 
          country: '🇨🇦 Canada', 
          city: 'Toronto', 
          visitors: 89, 
          uniqueIPs: 67,
          percentage: 10.4 
        },
        { 
          country: '🇩🇪 Germany', 
          city: 'Berlin', 
          visitors: 67, 
          uniqueIPs: 52,
          percentage: 7.8 
        }
      ],
      
      recentLocations: [
        { 
          time: new Date().toLocaleTimeString(), 
          ip: '203.45.67.89', 
          city: 'Mumbai', 
          country: 'India',
          isp: 'Reliance Jio',
          page: '/',
          userAgent: 'Chrome 120.0 on Windows 10'
        },
        { 
          time: new Date(Date.now() - 30000).toLocaleTimeString(), 
          ip: '192.168.1.100', 
          city: 'New York', 
          country: 'USA',
          isp: 'Verizon',
          page: '/services',
          userAgent: 'Safari 17.0 on macOS'
        },
        { 
          time: new Date(Date.now() - 60000).toLocaleTimeString(), 
          ip: '185.23.45.67', 
          city: 'London', 
          country: 'UK',
          isp: 'BT Group',
          page: '/about',
          userAgent: 'Firefox 121.0 on Ubuntu'
        },
        { 
          time: new Date(Date.now() - 90000).toLocaleTimeString(), 
          ip: '142.67.89.12', 
          city: 'Toronto', 
          country: 'Canada',
          isp: 'Rogers',
          page: '/contact',
          userAgent: 'Chrome 120.0 on Android'
        },
        { 
          time: new Date(Date.now() - 120000).toLocaleTimeString(), 
          ip: '78.45.123.45', 
          city: 'Berlin', 
          country: 'Germany',
          isp: 'Deutsche Telekom',
          page: '/products',
          userAgent: 'Edge 120.0 on Windows 11'
        },
        { 
          time: new Date(Date.now() - 150000).toLocaleTimeString(), 
          ip: '210.56.78.90', 
          city: 'Delhi', 
          country: 'India',
          isp: 'Airtel',
          page: '/',
          userAgent: 'Chrome 119.0 on Android'
        }
      ],
      
      pages: [
        { path: '/', views: 543, unique: 421, avgTime: 145 },
        { path: '/about', views: 234, unique: 189, avgTime: 95 },
        { path: '/services', views: 198, unique: 165, avgTime: 180 },
        { path: '/contact', views: 142, unique: 120, avgTime: 75 },
        { path: '/products', views: 130, unique: 98, avgTime: 165 }
      ],

      // IP-based insights
      ipInsights: {
        totalUniqueIPs: 758,
        topISPs: [
          { name: 'Reliance Jio', visitors: 156, percentage: 20.6 },
          { name: 'Verizon', visitors: 134, percentage: 17.7 },
          { name: 'BT Group', visitors: 98, percentage: 12.9 },
          { name: 'Rogers', visitors: 67, percentage: 8.8 },
          { name: 'Deutsche Telekom', visitors: 52, percentage: 6.9 }
        ],
        vpnDetected: 23,
        mobileIPs: 345,
        desktopIPs: 413
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify(analyticsData)
    };

  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

// Helper function to calculate date range
function getDateRange(range) {
  const now = new Date();
  const ranges = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90
  };
  
  const days = ranges[range] || 7;
  return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
}
