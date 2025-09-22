// netlify/functions/track.js
const crypto = require('crypto');

// In-memory storage for demo
let visitors = [];
let pageStats = new Map();
let dailyStats = new Map();

const MAX_VISITORS = 5000;
const DATA_RETENTION_DAYS = 30;
const CLEANUP_FREQUENCY = 100;

function hashIP(ip) {
  try {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  } catch (error) {
    return 'unknown_hash';
  }
}

function generateSessionId(ipHash, userAgent) {
  try {
    const date = new Date().toISOString().split('T')[0];
    const sessionData = `${ipHash}_${userAgent}_${date}`;
    return crypto.createHash('md5').update(sessionData).digest('hex').substring(0, 12);
  } catch (error) {
    return 'unknown_session';
  }
}

function detectDeviceType(userAgent) {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone/.test(ua)) return 'Mobile';
  if (/tablet|ipad/.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getCountry(headers) {
  return headers['x-country'] || headers['cf-ipcountry'] || headers['x-vercel-ip-country'] || 'Unknown';
}

function cleanOldData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  
  const originalLength = visitors.length;
  visitors = visitors.filter(visitor => 
    new Date(visitor.timestamp) > cutoffDate
  );
  
  console.log(`Cleaned ${originalLength - visitors.length} old records`);
}

function validateTrackingData(data) {
  const errors = [];
  
  if (!data.page_url) {
    data.page_url = '/';
  }
  
  if (!data.title) {
    data.title = 'Unknown Page';
  }
  
  if (data.timeOnPage && isNaN(data.timeOnPage)) {
    data.timeOnPage = 0;
  }
  
  if (data.scrollDepth && (isNaN(data.scrollDepth) || data.scrollDepth < 0 || data.scrollDepth > 100)) {
    data.scrollDepth = 0;
  }
  
  return { isValid: errors.length === 0, errors, data };
}

function extractReferrerDomain(referrer) {
  if (!referrer || referrer === '' || referrer === 'direct') {
    return 'direct';
  }
  
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch (error) {
    return 'unknown';
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      let data = {};
      
      try {
        data = JSON.parse(event.body || '{}');
      } catch (parseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            status: 'error',
            message: 'Invalid JSON in request body',
            error: parseError.message
          })
        };
      }

      const validation = validateTrackingData(data);
      if (!validation.isValid) {
        console.warn('Data validation warnings:', validation.errors);
      }
      data = validation.data;

      const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      event.headers['client-ip'] || 
                      context.clientContext?.ip || 
                      'unknown';
      
      const ipHash = hashIP(clientIP);
      const userAgent = event.headers['user-agent'] || 'Unknown Browser';
      const timestamp = new Date().toISOString();
      const sessionId = generateSessionId(ipHash, userAgent);
      const deviceType = detectDeviceType(userAgent);
      const country = getCountry(event.headers);
      const referrerDomain = extractReferrerDomain(data.referrer);

      const visitor = {
        id: crypto.randomUUID(),
        ipHash,
        sessionId,
        pageUrl: data.page_url,
        referrer: data.referrer || null,
        referrerDomain,
        title: data.title,
        userAgent,
        deviceType,
        country,
        timestamp,
        screenResolution: data.screen_resolution || null,
        viewportSize: data.viewport_size || null,
        language: data.language || null,
        event: data.event || 'page_view',
        timeOnPage: data.timeOnPage || 0,
        scrollDepth: data.scrollDepth || 0,
        clicks: data.clicks || 0,
        loadTime: data.loadTime || null
      };

      visitors.push(visitor);

      const pageKey = visitor.pageUrl;
      if (!pageStats.has(pageKey)) {
        pageStats.set(pageKey, { 
          viewCount: 0, 
          uniqueVisitors: new Set(),
          totalTimeOnPage: 0,
          totalScrollDepth: 0
        });
      }
      
      const pageStat = pageStats.get(pageKey);
      pageStat.viewCount++;
      pageStat.uniqueVisitors.add(visitor.sessionId);
      if (visitor.timeOnPage) pageStat.totalTimeOnPage += visitor.timeOnPage;
      if (visitor.scrollDepth) pageStat.totalScrollDepth += visitor.scrollDepth;

      const dateKey = timestamp.split('T')[0];
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { 
          visits: 0, 
          uniqueVisitors: new Set(),
          totalTimeOnPage: 0,
          avgScrollDepth: 0
        });
      }
      
      const dailyStat = dailyStats.get(dateKey);
      dailyStat.visits++;
      dailyStat.uniqueVisitors.add(visitor.sessionId);
      if (visitor.timeOnPage) dailyStat.totalTimeOnPage += visitor.timeOnPage;

      if (visitors.length % CLEANUP_FREQUENCY === 0) {
        cleanOldData();
      }

      if (visitors.length > MAX_VISITORS) {
        visitors = visitors.slice(-MAX_VISITORS);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'success',
          message: 'Visit tracked successfully',
          sessionId: visitor.sessionId,
          timestamp,
          visitorCount: visitors.length
        })
      };

    } catch (error) {
      console.error('Tracking error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Internal server error while tracking visit',
          error: error.message
        })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentVisitors = visitors.filter(v => new Date(v.timestamp) > thirtyDaysAgo);
      const weeklyVisitors = visitors.filter(v => new Date(v.timestamp) > sevenDaysAgo);
      const dailyVisitors = visitors.filter(v => new Date(v.timestamp) > oneDayAgo);

      const uniqueVisitors30d = new Set(recentVisitors.map(v => v.sessionId)).size;
      const uniqueVisitors7d = new Set(weeklyVisitors.map(v => v.sessionId)).size;
      const uniqueVisitors24h = new Set(dailyVisitors.map(v => v.sessionId)).size;

      const topPages = Array.from(pageStats.entries())
        .map(([page, stats]) => ({
          page,
          visits: stats.viewCount,
          uniqueVisitors: stats.uniqueVisitors.size,
          avgTimeOnPage: stats.viewCount > 0 ? Math.round(stats.totalTimeOnPage / stats.viewCount) : 0,
          avgScrollDepth: stats.viewCount > 0 ? Math.round(stats.totalScrollDepth / stats.viewCount) : 0
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      const deviceBreakdown = {};
      recentVisitors.forEach(v => {
        deviceBreakdown[v.deviceType] = (deviceBreakdown[v.deviceType] || 0) + 1;
      });

      const countryBreakdown = {};
      recentVisitors.forEach(v => {
        countryBreakdown[v.country] = (countryBreakdown[v.country] || 0) + 1;
      });

      const referrerBreakdown = {};
      recentVisitors.forEach(v => {
        if (v.referrerDomain && v.referrerDomain !== 'direct') {
          referrerBreakdown[v.referrerDomain] = (referrerBreakdown[v.referrerDomain] || 0) + 1;
        }
      });

      const dailyStatsArray = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const dayVisitors = visitors.filter(v => v.timestamp.startsWith(dateKey));
        const dayUniqueVisitors = new Set(dayVisitors.map(v => v.sessionId));

        dailyStatsArray.push({
          date: dateKey,
          visits: dayVisitors.length,
          uniqueVisitors: dayUniqueVisitors.size,
          avgTimeOnPage: dayVisitors.length > 0 ? 
            Math.round(dayVisitors.reduce((sum, v) => sum + (v.timeOnPage || 0), 0) / dayVisitors.length) : 0
        });
      }

      const avgLoadTime = recentVisitors
        .filter(v => v.loadTime && v.loadTime > 0)
        .reduce((sum, v, _, arr) => sum + v.loadTime / arr.length, 0);

      const avgScrollDepth = recentVisitors
        .filter(v => v.scrollDepth && v.scrollDepth > 0)
        .reduce((sum, v, _, arr) => sum + v.scrollDepth / arr.length, 0);

      const bounceRate = recentVisitors.length > 0 ? 
        Math.round((recentVisitors.filter(v => v.timeOnPage < 10000).length / recentVisitors.length) * 100) : 0;

      const activeThreshold = 5 * 60 * 1000;
      const activeVisitors = visitors.filter(v => 
        (Date.now() - new Date(v.timestamp).getTime()) < activeThreshold
      );

      const stats = {
        overview: {
          totalVisits30d: recentVisitors.length,
          totalVisits7d: weeklyVisitors.length,
          totalVisits24h: dailyVisitors.length,
          uniqueVisitors30d: uniqueVisitors30d,
          uniqueVisitors7d: uniqueVisitors7d,
          uniqueVisitors24h: uniqueVisitors24h,
          avgDailyVisits: Math.round(recentVisitors.length / 30),
          bounceRate: bounceRate,
          avgLoadTime: Math.round(avgLoadTime),
          avgScrollDepth: Math.round(avgScrollDepth),
          activeVisitors: activeVisitors.length
        },
        
        topPages: topPages,
        
        deviceBreakdown: Object.entries(deviceBreakdown)
          .map(([device, count]) => ({
            device,
            count,
            percentage: Math.round((count / recentVisitors.length) * 100)
          }))
          .sort((a, b) => b.count - a.count),

        countryBreakdown: Object.entries(countryBreakdown)
          .map(([country, count]) => ({
            country,
            count,
            percentage: Math.round((count / recentVisitors.length) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),

        topReferrers: Object.entries(referrerBreakdown)
          .map(([referrer, count]) => ({
            referrer,
            count,
            percentage: Math.round((count / recentVisitors.length) * 100)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),

        dailyStats: dailyStatsArray,
        
        realTimeEvents: visitors
          .filter(v => (Date.now() - new Date(v.timestamp).getTime()) < 60000)
          .map(v => ({
            timestamp: v.timestamp,
            page: v.pageUrl,
            country: v.country,
            device: v.deviceType,
            event: v.event
          })),

        metadata: {
          lastUpdated: new Date().toISOString(),
          dataRetention: `${DATA_RETENTION_DAYS} days`,
          totalRecords: visitors.length,
          oldestRecord: visitors.length > 0 ? visitors[0].timestamp : null
        }
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };

    } catch (error) {
      console.error('Stats generation error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Failed to generate analytics',
          error: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      status: 'error',
      message: 'Method not allowed. Use GET for analytics or POST for tracking.'
    })
  };
};
