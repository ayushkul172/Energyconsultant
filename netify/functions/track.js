// netlify/functions/track.js
// Main visitor tracking function

const crypto = require('crypto');

// In-memory storage for demo (use external DB for production persistence)
let visitors = [];
let pageStats = new Map();
let dailyStats = new Map();

// Helper function to hash IP for privacy
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

// Helper function to get session ID
function generateSessionId(ipHash, userAgent) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sessionData = `${ipHash}_${userAgent}_${date}`;
  return crypto.createHash('md5').update(sessionData).digest('hex').substring(0, 12);
}

// Helper function to detect device type
function detectDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'Mobile';
  if (/tablet|ipad/.test(ua)) return 'Tablet';
  return 'Desktop';
}

// Helper function to get country from Netlify headers
function getCountry(headers) {
  return headers['x-country'] || headers['cf-ipcountry'] || 'Unknown';
}

// Helper function to clean old data (keep last 30 days)
function cleanOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  visitors = visitors.filter(visitor => 
    new Date(visitor.timestamp) > thirtyDaysAgo
  );
}

// Main handler function
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle POST requests for tracking
  if (event.httpMethod === 'POST') {
    try {
      // Parse request data
      const data = JSON.parse(event.body || '{}');
      
      // Get visitor information
      const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
      const ipHash = hashIP(ip);
      const userAgent = event.headers['user-agent'] || 'Unknown';
      const timestamp = new Date().toISOString();
      const sessionId = generateSessionId(ipHash, userAgent);
      const deviceType = detectDeviceType(userAgent);
      const country = getCountry(event.headers);
      
      // Create visitor record
      const visitor = {
        id: crypto.randomUUID(),
        ipHash: ipHash,
        sessionId: sessionId,
        pageUrl: data.page_url || '/',
        referrer: data.referrer || null,
        title: data.title || '',
        userAgent: userAgent,
        deviceType: deviceType,
        country: country,
        timestamp: timestamp,
        screenResolution: data.screen_resolution || null,
        viewportSize: data.viewport_size || null,
        language: data.language || null
      };

      // Store visitor data
      visitors.push(visitor);
      
      // Update page stats
      const pageKey = visitor.pageUrl;
      if (!pageStats.has(pageKey)) {
        pageStats.set(pageKey, { viewCount: 0, uniqueVisitors: new Set() });
      }
      const pageStat = pageStats.get(pageKey);
      pageStat.viewCount++;
      pageStat.uniqueVisitors.add(visitor.sessionId);
      
      // Update daily stats
      const dateKey = timestamp.split('T')[0]; // YYYY-MM-DD
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { visits: 0, uniqueVisitors: new Set() });
      }
      const dailyStat = dailyStats.get(dateKey);
      dailyStat.visits++;
      dailyStat.uniqueVisitors.add(visitor.sessionId);
      
      // Clean old data periodically (every 100 requests)
      if (visitors.length % 100 === 0) {
        cleanOldData();
      }
      
      // Limit memory usage (keep last 5000 visitors)
      if (visitors.length > 5000) {
        visitors = visitors.slice(-5000);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'success',
          message: 'Visit tracked successfully',
          sessionId: visitor.sessionId,
          timestamp: timestamp
        })
      };

    } catch (error) {
      console.error('Tracking error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Failed to track visit',
          error: error.message
        })
      };
    }
  }

  // Handle GET requests for basic stats
  if (event.httpMethod === 'GET') {
    try {
      // Calculate basic statistics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Filter recent visitors
      const recentVisitors = visitors.filter(v => new Date(v.timestamp) > thirtyDaysAgo);
      const weeklyVisitors = visitors.filter(v => new Date(v.timestamp) > sevenDaysAgo);
      
      // Calculate unique visitors
      const uniqueVisitors30d = new Set(recentVisitors.map(v => v.sessionId)).size;
      const uniqueVisitors7d = new Set(weeklyVisitors.map(v => v.sessionId)).size;
      
      // Top pages
      const topPages = Array.from(pageStats.entries())
        .map(([page, stats]) => ({
          page,
          visits: stats.viewCount,
          uniqueVisitors: stats.uniqueVisitors.size
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
      
      // Device breakdown
      const deviceBreakdown = {};
      recentVisitors.forEach(v => {
        deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1;
      });
      
      // Country breakdown
      const countryBreakdown = {};
      recentVisitors.forEach(v => {
        countryBreakdown[v.country] = (countryBreakdown[v.country] || 0) + 1;
      });
      
      // Referrer breakdown
      const referrerBreakdown = {};
      recentVisitors.forEach(v => {
        if (v.referrer && v.referrer !== '') {
          const domain = new URL(v.referrer).hostname;
          referrerBreakdown[domain] = (referrerBreakdown[domain] || 0) + 1;
        }
      });
      
      // Daily stats for last 30 days
      const dailyStatsArray = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const dayVisitors = visitors.filter(v => v.timestamp.startsWith(dateKey));
        
        dailyStatsArray.push({
          date: dateKey,
          visits: dayVisitors.length,
          uniqueVisitors: new Set(dayVisitors.map(v => v.sessionId)).size
        });
      }

      const stats = {
        totalVisits30d: recentVisitors.length,
        totalVisits7d: weeklyVisitors.length,
        uniqueVisitors30d: uniqueVisitors30d,
        uniqueVisitors7d: uniqueVisitors7d,
        avgDailyVisits: Math.round(recentVisitors.length / 30),
        topPages: topPages,
        deviceBreakdown: Object.entries(deviceBreakdown).map(([device, count]) => ({
          device,
          count,
          percentage: Math.round((count / recentVisitors.length) * 100)
        })),
        countryBreakdown: Object.entries(countryBreakdown).map(([country, count]) => ({
          country,
          count,
          percentage: Math.round((count / recentVisitors.length) * 100)
        })).slice(0, 10),
        topReferrers: Object.entries(referrerBreakdown).map(([referrer, count]) => ({
          referrer,
          count
        })).sort((a, b) => b.count - a.count).slice(0, 10),
        dailyStats: dailyStatsArray,
        lastUpdated: new Date().toISOString(),
        dataRetention: '30 days'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };

    } catch (error) {
      console.error('Stats error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Failed to generate stats',
          error: error.message
        })
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      status: 'error',
      message: 'Method not allowed'
    })
  };
};
