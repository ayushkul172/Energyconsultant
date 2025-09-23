/**
 * Independent Website Tracking System
 * Main tracking library for collecting user analytics
 * Version: 1.0.0
 */

class WebTracker {
    constructor(config = {}) {
        this.config = {
            endpoint: config.endpoint || '/api/track',
            sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
            batchSize: config.batchSize || 10,
            flushInterval: config.flushInterval || 5000, // 5 seconds
            debug: config.debug || false,
            enableHeatmap: config.enableHeatmap || false,
            enableScrollTracking: config.enableScrollTracking || true,
            enableClickTracking: config.enableClickTracking || true,
            enableFormTracking: config.enableFormTracking || true,
            ...config
        };

        this.events = [];
        this.session = this.initSession();
        this.visitor = this.initVisitor();
        this.pageStartTime = Date.now();
        this.scrollDepth = 0;
        this.maxScrollDepth = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.trackPageView();
        this.startFlushTimer();
        
        if (this.config.debug) {
            console.log('WebTracker initialized:', this.config);
        }
    }

    // Session Management
    initSession() {
        const stored = localStorage.getItem('wt_session');
        const now = Date.now();

        if (stored) {
            const session = JSON.parse(stored);
            if (now - session.lastActivity < this.config.sessionTimeout) {
                session.lastActivity = now;
                session.pageViews = (session.pageViews || 0) + 1;
                localStorage.setItem('wt_session', JSON.stringify(session));
                return session;
            }
        }

        // Create new session
        const newSession = {
            id: this.generateId(),
            startTime: now,
            lastActivity: now,
            pageViews: 1,
            isNewSession: true
        };

        localStorage.setItem('wt_session', JSON.stringify(newSession));
        return newSession;
    }

    // Visitor Management
    initVisitor() {
        let visitor = localStorage.getItem('wt_visitor');
        
        if (!visitor) {
            visitor = {
                id: this.generateId(),
                firstVisit: Date.now(),
                visitCount: 1,
                isNewVisitor: true
            };
        } else {
            visitor = JSON.parse(visitor);
            visitor.visitCount = (visitor.visitCount || 0) + 1;
            visitor.isReturningVisitor = true;
        }

        localStorage.setItem('wt_visitor', JSON.stringify(visitor));
        return visitor;
    }

    // Event Tracking
    track(eventName, properties = {}) {
        const event = {
            id: this.generateId(),
            timestamp: Date.now(),
            sessionId: this.session.id,
            visitorId: this.visitor.id,
            eventName,
            properties: {
                ...this.getContextData(),
                ...properties
            }
        };

        this.events.push(event);

        if (this.config.debug) {
            console.log('Event tracked:', event);
        }

        if (this.events.length >= this.config.batchSize) {
            this.flush();
        }

        return event.id;
    }

    // Page View Tracking
    trackPageView(customProperties = {}) {
        const properties = {
            page: {
                url: window.location.href,
                path: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
                title: document.title,
                referrer: document.referrer
            },
            session: {
                isNewSession: this.session.isNewSession || false,
                pageViews: this.session.pageViews
            },
            visitor: {
                isNewVisitor: this.visitor.isNewVisitor || false,
                isReturningVisitor: this.visitor.isReturningVisitor || false,
                visitCount: this.visitor.visitCount
            },
            ...customProperties
        };

        this.track('page_view', properties);
    }

    // Click Tracking
    trackClick(element, customProperties = {}) {
        const properties = {
            element: {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                text: element.textContent?.substring(0, 100),
                href: element.href,
                position: this.getElementPosition(element)
            },
            ...customProperties
        };

        this.track('click', properties);
    }

    // Form Tracking
    trackFormSubmit(form, customProperties = {}) {
        const formData = new FormData(form);
        const fields = {};
        
        for (let [key, value] of formData.entries()) {
            // Don't track sensitive data
            if (!this.isSensitiveField(key)) {
                fields[key] = typeof value === 'string' ? value.substring(0, 100) : 'file';
            }
        }

        const properties = {
            form: {
                id: form.id,
                className: form.className,
                action: form.action,
                method: form.method,
                fieldCount: form.elements.length
            },
            fields,
            ...customProperties
        };

        this.track('form_submit', properties);
    }

    // Scroll Tracking
    trackScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        this.scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
        this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);

        // Track milestone scroll depths
        const milestones = [25, 50, 75, 90, 100];
        for (const milestone of milestones) {
            if (this.scrollDepth >= milestone && !this.scrollMilestones?.[milestone]) {
                this.scrollMilestones = this.scrollMilestones || {};
                this.scrollMilestones[milestone] = true;
                
                this.track('scroll_milestone', {
                    milestone,
                    scrollDepth: this.scrollDepth,
                    timeOnPage: Date.now() - this.pageStartTime
                });
            }
        }
    }

    // Time on Page Tracking
    trackTimeOnPage() {
        const timeOnPage = Date.now() - this.pageStartTime;
        
        this.track('time_on_page', {
            timeOnPage,
            maxScrollDepth: this.maxScrollDepth,
            page: {
                url: window.location.href,
                title: document.title
            }
        });
    }

    // Custom Event Tracking
    trackCustomEvent(eventName, properties = {}) {
        return this.track(eventName, {
            eventType: 'custom',
            ...properties
        });
    }

    // Error Tracking
    trackError(error, customProperties = {}) {
        const properties = {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                fileName: error.fileName,
                lineNumber: error.lineNumber,
                columnNumber: error.columnNumber
            },
            page: {
                url: window.location.href,
                title: document.title
            },
            ...customProperties
        };

        this.track('javascript_error', properties);
    }

    // Performance Tracking
    trackPerformance() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            if (navigation) {
                const properties = {
                    timing: {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                        tcpConnect: navigation.connectEnd - navigation.connectStart,
                        serverResponse: navigation.responseEnd - navigation.requestStart,
                        domProcessing: navigation.domComplete - navigation.responseEnd
                    },
                    paint: {}
                };

                paint.forEach(entry => {
                    properties.paint[entry.name.replace('first-', '')] = entry.startTime;
                });

                this.track('performance', properties);
            }
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Click tracking
        if (this.config.enableClickTracking) {
            document.addEventListener('click', (e) => {
                this.trackClick(e.target);
            });
        }

        // Form tracking
        if (this.config.enableFormTracking) {
            document.addEventListener('submit', (e) => {
                this.trackFormSubmit(e.target);
            });
        }

        // Scroll tracking
        if (this.config.enableScrollTracking) {
            let scrollTimer;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => this.trackScroll(), 100);
            });
        }

        // Page unload tracking
        window.addEventListener('beforeunload', () => {
            this.trackTimeOnPage();
            this.flush(true);
        });

        // Error tracking
        window.addEventListener('error', (e) => {
            this.trackError(e.error || {
                message: e.message,
                fileName: e.filename,
                lineNumber: e.lineno,
                columnNumber: e.colno
            });
        });

        // Performance tracking
        if (document.readyState === 'complete') {
            this.trackPerformance();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.trackPerformance(), 100);
            });
        }

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_hide');
                this.flush();
            } else {
                this.track('page_show');
            }
        });
    }

    // Helper Methods
    getContextData() {
        return {
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }

    isSensitiveField(fieldName) {
        const sensitiveFields = [
            'password', 'passwd', 'pwd',
            'creditcard', 'credit-card', 'cc',
            'ssn', 'social-security',
            'cvv', 'cvc', 'security-code'
        ];
        return sensitiveFields.some(field => 
            fieldName.toLowerCase().includes(field)
        );
    }

    generateId() {
        return 'wt_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Data Transmission
    flush(sync = false) {
        if (this.events.length === 0) return;

        const payload = {
            events: [...this.events],
            meta: {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            }
        };

        this.events = [];

        if (sync && navigator.sendBeacon) {
            navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
        } else {
            fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(error => {
                if (this.config.debug) {
                    console.error('Failed to send tracking data:', error);
                }
            });
        }

        if (this.config.debug) {
            console.log('Events flushed:', payload);
        }
    }

    startFlushTimer() {
        setInterval(() => {
            if (this.events.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    }

    // Public API
    identify(userId, traits = {}) {
        this.visitor.userId = userId;
        this.visitor.traits = { ...this.visitor.traits, ...traits };
        localStorage.setItem('wt_visitor', JSON.stringify(this.visitor));
        
        this.track('identify', {
            userId,
            traits
        });
    }

    page(name, properties = {}) {
        this.trackPageView({
            pageName: name,
            ...properties
        });
    }

    event(eventName, properties = {}) {
        return this.trackCustomEvent(eventName, properties);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Initialize tracker when DOM is ready
let tracker;

function initWebTracker(config = {}) {
    if (!tracker) {
        tracker = new WebTracker(config);
    }
    return tracker;
}

// Global API
window.wt = window.wt || {
    init: initWebTracker,
    track: (eventName, properties) => tracker?.trackCustomEvent(eventName, properties),
    identify: (userId, traits) => tracker?.identify(userId, traits),
    page: (name, properties) => tracker?.page(name, properties),
    flush: () => tracker?.flush()
};

// Auto-initialize if config is provided
if (window.wtConfig) {
    initWebTracker(window.wtConfig);
}

export default WebTracker;
