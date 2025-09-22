// Enhanced client-side tracking script - Fixed version
// Compatible with the corrected Netlify function

(function() {
  'use strict';
  
  // Configuration - Updated to match fixed function
  const TRACKING_ENDPOINT = '/.netlify/functions/track';
  const TRACK_SCROLL_DEPTH = true;
  const TRACK_TIME_ON_PAGE = true;
  const TRACK_CLICKS = true;
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  
  // Tracking data object
  let trackingData = {
    page: window.location.pathname + window.location.search,
    referrer: document.referrer || 'direct',
    loadTime: null,
    domReady: null,
    startTime: Date.now(),
    scrollDepth: 0,
    clicks: 0,
    timeOnPage: 0,
    isActive: true
  };
  
  // Session management
  let sessionId = null;
  let lastHeartbeat = Date.now();
  
  // Get UTM parameters from URL
  function getUtmParameters() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content')
    };
  }
  
  // Track page load performance
  function trackPagePerformance() {
    // Use both Navigation Timing API and Performance Observer
    window.addEventListener('load', function() {
      setTimeout(() => {
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          trackingData.loadTime = timing.loadEventEnd - timing.navigationStart;
          trackingData.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        }
        
        // Also try Performance Navigation API (newer)
        if (window.performance && window.performance.getEntriesByType) {
          const navEntries = window.performance.getEntriesByType('navigation');
          if (navEntries.length > 0) {
            trackingData.loadTime = Math.round(navEntries[0].loadEventEnd);
            trackingData.domReady = Math.round(navEntries[0].domContentLoadedEventEnd);
          }
        }
      }, 100);
    });
  }
  
  // Track scroll depth with throttling
  function trackScrollDepth() {
    if (!TRACK_SCROLL_DEPTH) return;
    
    let maxScroll = 0;
    let ticking = false;
    
    function updateScrollDepth() {
      try {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
        const documentHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        ) - window.innerHeight;
        
        if (documentHeight > 0) {
          const currentScroll = Math.round((scrollTop / documentHeight) * 100);
          maxScroll = Math.max(maxScroll, Math.min(currentScroll, 100));
          trackingData.scrollDepth = maxScroll;
        }
      } catch (error) {
        console.warn('Error tracking scroll depth:', error);
      }
      ticking = false;
    }
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    }, { passive: true });
  }
  
  // Track time on page with activity detection
  function trackTimeOnPage() {
    if (!TRACK_TIME_ON_PAGE) return;
    
    let lastActivity = Date.now();
    
    function handleActivity() {
      trackingData.isActive = true;
      lastActivity = Date.now();
    }
    
    function handleInactivity() {
      trackingData.isActive = false;
    }
    
    // Activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(function(event) {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Visibility events
    window.addEventListener('blur', handleInactivity);
    window.addEventListener('focus', handleActivity);
    
    // Page visibility API
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        handleInactivity();
      } else {
        handleActivity();
      }
    });
    
    // Update time periodically, only when active
    setInterval(function() {
      if (trackingData.isActive && (Date.now() - lastActivity) < 60000) {
        trackingData.timeOnPage = Date.now() - trackingData.startTime;
      }
    }, 1000);
  }
  
  // Track clicks with detailed information
  function trackClicks() {
    if (!TRACK_CLICKS) return;
    
    document.addEventListener('click', function(e) {
      trackingData.clicks++;
      
      // Store detailed click information
      const target = e.target;
      const elementData = {
        tag: target.tagName ? target.tagName.toLowerCase() : 'unknown',
        id: target.id || null,
        className: target.className || null,
        href: target.href || null,
        text: target.textContent ? target.textContent.substring(0, 50).trim() : null,
        x: e.clientX,
        y: e.clientY
      };
      
      // Store in global array for access
      if (!window.clickData) window.clickData = [];
      window.clickData.push({
        timestamp: Date.now(),
        element: elementData
      });
      
      // Send click event immediately for important elements
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        sendTrackingData({
          event: 'click',
          elementType: target.tagName.toLowerCase(),
          elementText: elementData.text,
          href: elementData.href
        });
      }
    }, { passive: true });
  }
  
  // Enhanced data sending with proper error handling
  function sendTrackingData(additionalData = {}) {
    try {
      const utmParams = getUtmParameters();
      
      const payload = {
        // Basic page info
        page_url: trackingData.page,
        referrer: trackingData.referrer,
        title: document.title || 'Untitled',
        
        // Performance metrics
        loadTime: trackingData.loadTime,
        domReady: trackingData.domReady,
        timeOnPage: trackingData.timeOnPage,
        scrollDepth: trackingData.scrollDepth,
        clicks: trackingData.clicks,
        
        // Device info
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || 'unknown',
        user_agent: navigator.userAgent,
        
        // Session info
        session_id: sessionId,
        timestamp: Date.now(),
        is_active: trackingData.isActive,
        
        // UTM parameters
        ...utmParams,
        
        // Additional data
        ...additionalData
      };
      
      // Remove null/undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });
      
      // Send via fetch with proper error handling
      return fetch(TRACKING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true // Important for tracking during page unload
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      }).then(data => {
        if (data.sessionId && !sessionId) {
          sessionId = data.sessionId;
        }
        return data;
      }).catch(error => {
        console.warn('Tracking failed:', error);
        // Fallback: try sending via image pixel
        return sendViaPixel(payload);
      });
      
    } catch (error) {
      console.error('Error preparing tracking data:', error);
      return Promise.reject(error);
    }
  }
  
  // Fallback method using image pixel
  function sendViaPixel(data) {
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const img = new Image(1, 1);
      img.src = `${TRACKING_ENDPOINT}?${params.toString()}`;
      
      return new Promise((resolve) => {
        img.onload = () => resolve({ status: 'success', method: 'pixel' });
        img.onerror = () => resolve({ status: 'failed', method: 'pixel' });
      });
    } catch (error) {
      console.warn('Pixel fallback failed:', error);
      return Promise.resolve({ status: 'failed', method: 'pixel' });
    }
  }
  
  // Enhanced page visibility tracking
  function trackPageVisibility() {
    let isVisible = !document.hidden;
    let visibilityStartTime = Date.now();
    let totalVisibleTime = 0;
    
    document.addEventListener('visibilitychange', function() {
      const now = Date.now();
      
      if (document.hidden) {
        // Page became hidden
        if (isVisible) {
          totalVisibleTime += now - visibilityStartTime;
          isVisible = false;
          
          sendTrackingData({
            event: 'visibility_hidden',
            visible_time: totalVisibleTime,
            total_time: now - trackingData.startTime
          });
        }
      } else {
        // Page became visible
        isVisible = true;
        visibilityStartTime = now;
        
        sendTrackingData({
          event: 'visibility_shown',
          hidden_duration: now - visibilityStartTime
        });
      }
    });
    
    // Track page unload
    const unloadHandler = function() {
      if (isVisible) {
        totalVisibleTime += Date.now() - visibilityStartTime;
      }
      
      sendTrackingData({
        event: 'page_unload',
        total_visible_time: totalVisibleTime,
        total_time: Date.now() - trackingData.startTime,
        final_scroll_depth: trackingData.scrollDepth,
        final_clicks: trackingData.clicks
      });
    };
    
    // Use multiple unload events for better coverage
    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('unload', unloadHandler);
    window.addEventListener('pagehide', unloadHandler);
  }
  
  // Initialize all tracking
  function initTracking() {
    trackPagePerformance();
    trackScrollDepth();
    trackTimeOnPage();
    trackClicks();
    trackPageVisibility();
    
    // Send initial page view
    const sendInitialTracking = () => {
      sendTrackingData({ event: 'page_view' })
        .then(response => {
          console.log('Tracking initialized:', response);
        });
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(sendInitialTracking, 100);
      });
    } else {
      setTimeout(sendInitialTracking, 100);
    }
    
    // Send periodic heartbeat
    setInterval(function() {
      if (trackingData.isActive && (Date.now() - lastHeartbeat) >= HEARTBEAT_INTERVAL) {
        sendTrackingData({ event: 'heartbeat' });
        lastHeartbeat = Date.now();
      }
    }, HEARTBEAT_INTERVAL);
  }
  
  // Start tracking when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }
  
  // Global API for manual event tracking
  window.trackEvent = function(eventName, eventData = {}) {
    return sendTrackingData({
      event: eventName,
      ...eventData
    });
  };
  
  // Global API to get current tracking data
  window.getTrackingData = function() {
    return {
      ...trackingData,
      sessionId: sessionId,
      currentUrl: window.location.href,
      timestamp: Date.now()
    };
  };
  
  // Global API to get analytics (calls the GET endpoint)
  window.getAnalytics = function() {
    return fetch(TRACKING_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    }).then(response => response.json());
  };
  
})();
