exports.handler = async (event) => {
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
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { range = '7d' } = event.queryStringParameters || {};

    // Mock data - replace with database queries
    const analyticsData = {
      pageviews: 1247,
      visitors: 856,
      avgDuration: 124,
      bounceRate: 0.38,
      pageviewsChange: 0.12,
      visitorsChange: 0.08,
      durationChange: 0.05,
      bounceChange: -0.02,
      
      geographic: [
        { country: "🇺🇸 United States", city: "New York", visitors: 245, uniqueIPs: 189, percentage: 28.6 },
        { country: "🇮🇳 India", city: "Mumbai", visitors: 198, uniqueIPs: 156, percentage: 23.1 },
        { country: "🇬🇧 United Kingdom", city: "London", visitors: 134, uniqueIPs: 98, percentage: 15.6 },
        { country: "🇨🇦 Canada", city: "Toronto", visitors: 89, uniqueIPs: 67, percentage: 10.4 },
        { country: "🇩🇪 Germany", city: "Berlin", visitors: 67, uniqueIPs: 52, percentage: 7.8 }
      ],
      
      recentLocations: [
        { time: new Date().toLocaleTimeString(), ip: "203.45.67.89", city: "Mumbai", country: "India", isp: "Reliance Jio", page: "/" },
        { time: new Date(Date.now()-30000).toLocaleTimeString(), ip: "192.168.1.100", city: "New York", country: "USA", isp: "Verizon", page: "/services" },
        { time: new Date(Date.now()-60000).toLocaleTimeString(), ip: "185.23.45.67", city: "London", country: "UK", isp: "BT Group", page: "/about" }
      ],
      
      pages: [
        { path: "/", views: 543, unique: 421, avgTime: 145 },
        { path: "/about", views: 234, unique: 189, avgTime: 95 },
        { path: "/services", views: 198, unique: 165, avgTime: 180 }
      ],

      ipInsights: {
        totalUniqueIPs: 758,
        topISPs: [
          { name: "Reliance Jio", visitors: 156, percentage: 20.6 },
          { name: "Verizon", visitors: 134, percentage: 17.7 },
          { name: "BT Group", visitors: 98, percentage: 12.9 }
        ]
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify(analyticsData)
    };

  } catch (error) {
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
