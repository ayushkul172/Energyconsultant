// Enhanced client-side tracking script
// Add this to your HTML pages or as a separate JS file

(function() {
  'use strict';
  
  // Configuration
  const TRACKING_ENDPOINT = '/.netlify/functions/track-pixel';
  const TRACK_SCROLL_DEPTH = true;
  const TRACK_TIME_ON_PAGE = true;
  const TRACK_CLICKS = true;
  
  // Tracking data object
  let trackingData = {
    page: window.location.pathname + window.location.search,
    referrer: document.referrer || 'direct',
    loadTime: null,
    domReady: null,
    startTime: Date.now(),
    scrollDepth: 0,
    clicks: 0,
    timeOnPage: 0
  };
  
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
    // Wait for load event
    window.addEventListener('load', function() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        trackingData.loadTime = timing.loadEventEnd - timing.navigationStart;
        trackingData.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      }
    });
  }
  
  // Track scroll depth
  function trackScrollDepth() {
    if (!TRACK_SCROLL_DEPTH) return;
    
    let maxScroll = 0;
    let ticking = false;
    
    function updateScrollDepth() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = Math.round((scrollTop / documentHeight) * 100);
      
      maxScroll = Math.max(maxScroll, currentScroll);
      trackingData.scrollDepth = Math.min(maxScroll, 100);
      ticking = false;
    }
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    });
  }
  
  // Track time on page
  function trackTimeOnPage() {
    if (!TRACK_TIME_ON_PAGE) return;
    
    let isActive = true;
    let lastActivity = Date.now();
    
    // Track when user becomes inactive
    function handleActivity() {
      isActive = true;
      lastActivity = Date.now();
    }
    
    function handleInactivity() {
      isActive = false;
    }
    
    // Activity events
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(function(event) {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Inactivity events
    window.addEventListener('blur', handleInactivity);
    window.addEventListener('focus', handleActivity);
    
    // Update time on page periodically
    setInterval(function() {
      if (isActive) {
        trackingData.timeOnPage = Date.now() - trackingData.startTime;
      }
    }, 1000);
  }
  
  // Track clicks
  function trackClicks() {
    if (!TRACK_CLICKS) return;
    
    document.addEventListener('click', function(e) {
      trackingData.clicks++;
      
      // Track specific element clicks
      const target = e.target;
      const elementData = {
        tag: target.tagName.toLowerCase(),
        id: target.id || null,
        className: target.className || null,
        href: target.href || null,
        text: target.textContent ? target.textContent.substring(0, 50) : null
      };
      
      // Store click data (you might want to send this separately)
      if (!window.clickData) window.clickData = [];
      window.clickData.push({
        timestamp: Date.now(),
        element: elementData,
        x: e.clientX,
        y: e.clientY
      });
    });
  }
  
  // Send tracking data
  function sendTrackingData(additionalData = {}) {
    const utmParams = getUtmParameters();
    const params = new URLSearchParams({
      ...trackingData,
      ...additionalData,
      ...utmParams,
      timestamp: Date.now()
    });
    
    // Remove null/undefined values
    for (const [key, value] of params.entries()) {
      if (value === null || value === undefined || value === 'null') {
        params.delete(key);
      }
    }
    
    // Create tracking pixel
    const img = new Image(1, 1);
    img.src = `${TRACKING_ENDPOINT}?${params.toString()}`;
    
    // For debugging - remove in production
    // console.log('Tracking data sent:', Object.fromEntries(params));
  }
  
  // Enhanced visibility API tracking
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
          
          // Send data when page becomes hidden
          sendTrackingData({
            event: 'visibility_hidden',
            visibleTime: totalVisibleTime
          });
        }
      } else {
        // Page became visible
        isVisible = true;
        visibilityStartTime = now;
      }
    });
    
    // Send visible time on unload
    window.addEventListener('beforeunload', function() {
      if (isVisible) {
        totalVisibleTime += Date.now() - visibilityStartTime;
      }
      sendTrackingData({
        event: 'page_unload',
        totalVisibleTime: totalVisibleTime
      });
    });
  }
  
  // Initialize tracking
  function initTracking() {
    // Basic page view tracking
    trackPagePerformance();
    trackScrollDepth();
    trackTimeOnPage();
    trackClicks();
    trackPageVisibility();
    
    // Send initial page view
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => sendTrackingData({ event: 'page_view' }), 100);
      });
    } else {
      setTimeout(() => sendTrackingData({ event: 'page_view' }), 100);
    }
    
    // Send data periodically for long sessions
    setInterval(function() {
      sendTrackingData({ event: 'heartbeat' });
    }, 30000); // Every 30 seconds
  }
  
  // Start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }
  
  // Expose tracking function globally for manual events
  window.trackEvent = function(eventName, eventData = {}) {
    sendTrackingData({
      event: eventName,
      ...eventData
    });
  };
  
})();
