<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AK Energy Intelligence - Analytics Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .live-dot { 
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .metric-card { 
            transition: all 0.3s ease;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(59, 130, 246, 0.1);
        }
        .metric-card:hover { 
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .feature-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(59, 130, 246, 0.2);
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-2px);
            border-color: rgba(59, 130, 246, 0.4);
        }
        .chart-container {
            background: rgba(30, 41, 59, 0.9);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(59, 130, 246, 0.15);
        }
        .glow-effect {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }
        .status-badge {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            backdrop-filter: blur(10px);
        }
        .time-range-active {
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
    </style>
</head>
<body class="text-white min-h-screen">
    <div class="max-w-7xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <div class="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl glow-effect">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">AK Energy Intelligence</h1>
                        <p class="text-blue-300/80 text-lg">Advanced Analytics & Business Intelligence Suite</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="status-badge px-4 py-2 rounded-full text-sm font-medium text-green-400 flex items-center">
                        <span class="w-2 h-2 bg-green-400 rounded-full mr-2 live-dot"></span>
                        Local Storage Active
                    </span>
                    <span class="px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400">CLIENT-SIDE</span>
                    <span class="status-badge px-4 py-2 rounded-full text-sm font-medium text-green-400">SYSTEM ONLINE</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <button class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 glow-effect hover:shadow-blue-500/25" onclick="refreshData()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span class="font-medium">Refresh Data</span>
                    </button>
                    <button class="bg-slate-700/50 hover:bg-slate-600/50 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 backdrop-filter backdrop-blur-sm border border-slate-600/30" onclick="exportData()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span class="font-medium">Export Analytics</span>
                    </button>
                    <button class="bg-red-600/50 hover:bg-red-700/50 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 backdrop-filter backdrop-blur-sm border border-red-600/30" onclick="clearAllData()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span class="font-medium">Clear Data</span>
                    </button>
                </div>
                
                <div class="flex items-center space-x-4">
                    <div class="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 backdrop-filter backdrop-blur-sm">
                        <button class="time-range-btn px-6 py-2 text-sm rounded-lg time-range-active text-white font-medium" data-range="7d">7 Days</button>
                        <button class="time-range-btn px-6 py-2 text-sm rounded-lg text-slate-400 hover:text-white font-medium transition-colors" data-range="30d">30 Days</button>
                        <button class="time-range-btn px-6 py-2 text-sm rounded-lg text-slate-400 hover:text-white font-medium transition-colors" data-range="90d">90 Days</button>
                        <button class="time-range-btn px-6 py-2 text-sm rounded-lg text-slate-400 hover:text-white font-medium transition-colors" data-range="1y">1 Year</button>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-slate-400">Last sync:</div>
                        <div class="text-sm text-white font-semibold" id="lastSync">Loading...</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Status Info -->
        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <span class="text-white font-medium">Data Storage: </span>
                    <span class="text-blue-300" id="dataStatus">Initializing...</span>
                    <span class="text-slate-400 text-sm ml-4">Total sessions recorded: <span id="totalSessions" class="text-white font-semibold">0</span></span>
                </div>
            </div>
        </div>

        <!-- Enhanced Main Metrics -->
        <div class="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <!-- Total Visits -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">TOTAL VISITS</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="totalVisits">0</p>
                <div class="flex items-center text-sm font-semibold text-green-400">
                    <span class="mr-1">↗</span>
                    <span id="totalVisitsChange">Loading...</span>
                </div>
            </div>

            <!-- Unique Visitors -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">UNIQUE VISITORS</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="uniqueVisitors">0</p>
                <div class="flex items-center text-sm font-semibold text-green-400">
                    <span class="mr-1">↗</span>
                    <span id="uniqueVisitorsChange">Loading...</span>
                </div>
            </div>

            <!-- Daily Average -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">DAILY AVERAGE</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="dailyAverage">0</p>
                <div class="flex items-center text-sm font-semibold text-green-400">
                    <span class="mr-1">↗</span>
                    <span>Based on selected period</span>
                </div>
            </div>

            <!-- Bounce Rate -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">BOUNCE RATE</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="bounceRate">0%</p>
                <div class="flex items-center text-sm font-semibold text-green-400">
                    <span class="mr-1">↘</span>
                    <span id="bounceRateChange">Loading...</span>
                </div>
            </div>

            <!-- Session Duration -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">AVG SESSION</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="avgSession">0s</p>
                <div class="flex items-center text-sm font-semibold text-green-400">
                    <span class="mr-1">↗</span>
                    <span>Engagement metric</span>
                </div>
            </div>

            <!-- Storage Used -->
            <div class="metric-card rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <p class="text-blue-300/80 text-xs font-bold uppercase tracking-wider">STORAGE USED</p>
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                        </svg>
                    </div>
                </div>
                <p class="font-black text-white text-5xl mb-3" id="storageUsed">0KB</p>
                <div class="flex items-center text-sm font-semibold text-blue-400">
                    <span>Local browser storage</span>
                </div>
            </div>
        </div>

        <!-- Advanced Visitor Analytics Chart -->
        <div class="chart-container rounded-2xl p-8 glow-effect mb-8">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-white text-2xl font-bold">Visitor Analytics Over Time</h3>
                </div>
                <div class="text-sm text-slate-400">
                    Data Range: <span id="chartDateRange" class="text-white font-semibold">Loading...</span>
                </div>
            </div>
            
            <!-- Chart Legend -->
            <div class="flex items-center space-x-8 mb-8">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span class="text-slate-300 text-sm font-medium">Daily Visits</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span class="text-slate-300 text-sm font-medium">Unique Visitors</span>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-slate-300 text-sm font-medium">Avg Session Duration</span>
                </div>
            </div>
            
            <canvas id="advancedChart" height="400"></canvas>
        </div>

        <!-- Recent Sessions -->
        <div class="chart-container rounded-2xl p-8 glow-effect">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white text-xl font-bold">Recent Sessions</h3>
                <span class="text-sm text-slate-400">Last 10 sessions</span>
            </div>
            <div class="space-y-3" id="recentSessions">
                <div class="text-center text-slate-400 py-8">
                    No sessions recorded yet. Start browsing to see data!
                </div>
            </div>
        </div>
    </div>

    <!-- Client-Side Analytics with Local Storage -->
    <script>
        class ClientSideAnalytics {
            constructor() {
                this.storageKey = 'ak_analytics_data';
                this.sessionKey = 'ak_current_session';
                this.visitorKey = 'ak_visitor_id';
                
                this.currentSession = null;
                this.visitorId = null;
                this.startTime = Date.now();
                this.isActive = true;
                
                this.init();
            }

            init() {
                this.visitorId = this.getOrCreateVisitorId();
                this.currentSession = this.createSession();
                this.startTracking();
                this.setupEventListeners();
                console.log('Analytics initialized:', { visitorId: this.visitorId, sessionId: this.currentSession.id });
            }

            getOrCreateVisitorId() {
                let id = localStorage.getItem(this.visitorKey);
                if (!id) {
                    id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem(this.visitorKey, id);
                }
                return id;
            }

            createSession() {
                const session = {
                    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    visitorId: this.visitorId,
                    startTime: Date.now(),
                    endTime: null,
                    duration: 0,
                    pageViews: 1,
                    scrollDepth: 0,
                    clicks: 0,
                    url: window.location.href,
                    title: document.title,
                    referrer: document.referrer || 'direct',
                    userAgent: navigator.userAgent,
                    screenResolution: `${screen.width}x${screen.height}`,
                    language: navigator.language,
                    isActive: true
                };
                
                sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
                return session;
            }

            startTracking() {
                // Track page visibility
                document.addEventListener('visibilitychange', () => {
                    this.isActive = !document.hidden;
                    if (!this.isActive) {
                        this.saveSession();
                    }
                });

                // Track beforeunload
                window.addEventListener('beforeunload', () => {
                    this.endSession();
                });

                // Track scroll depth
                let maxScroll = 0;
                window.addEventListener('scroll', () => {
                    const scrollPercent = Math.round(
                        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                    );
                    maxScroll = Math.max(maxScroll, scrollPercent || 0);
                    this.currentSession.scrollDepth = Math.min(maxScroll, 100);
                });

                // Track clicks
                document.addEventListener('click', () => {
                    this.currentSession.clicks++;
                });

                // Update duration every second
                setInterval(() => {
                    if (this.isActive) {
                        this.currentSession.duration = Date.now() - this.currentSession.startTime;
                        this.saveCurrentSession();
                    }
                }, 1000);

                // Save session every 30 seconds
                setInterval(() => {
                    this.saveSession();
                }, 30000);
            }

            saveCurrentSession() {
                sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
            }

            saveSession() {
                const data = this.getData();
                const existingIndex = data.sessions.findIndex(s => s.id === this.currentSession.id);
                
                if (existingIndex >= 0) {
                    data.sessions[existingIndex] = { ...this.currentSession };
                } else {
                    data.sessions.push({ ...this.currentSession });
                }

                this.saveData(data);
            }

            endSession() {
                this.currentSession.endTime = Date.now();
                this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
                this.currentSession.isActive = false;
                this.saveSession();
            }

            getData() {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    try {
                        return JSON.parse(stored);
                    } catch (e) {
                        console.error('Error parsing stored data:', e);
                    }
                }
                
                return {
                    sessions: [],
                    visitors: [],
                    createdAt: Date.now(),
                    version: '1.0'
                };
            }

            saveData(data) {
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                } catch (e) {
                    console.error('Error saving data:', e);
                    // Handle storage quota exceeded
                    this.cleanupOldData();
                }
            }

            cleanupOldData() {
                const data = this.getData();
                // Keep only last 1000 sessions
                if (data.sessions.length > 1000) {
                    data.sessions.sort((a, b) => b.startTime - a.startTime);
                    data.sessions = data.sessions.slice(0, 1000);
                    this.saveData(data);
                }
            }

            getAnalytics(days = 7) {
                const data = this.getData();
                const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
                const recentSessions = data.sessions.filter(s => s.startTime >= cutoffTime);

                const totalSessions = recentSessions.length;
                const uniqueVisitors = new Set(recentSessions.map(s => s.visitorId)).size;
                const totalDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0);
                const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
                const bounces = recentSessions.filter(s => s.duration < 30000 && s.pageViews <= 1).length;
                const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;
                const dailyAverage = totalSessions / Math.max(1, days);

                return {
                    totalSessions,
                    uniqueVisitors,
                    avgSessionDuration: Math.round(avgSessionDuration / 1000), // Convert to seconds
                    bounceRate: Math.round(bounceRate),
                    dailyAverage: Math.round(dailyAverage),
                    recentSessions: recentSessions.slice(-10).reverse(), // Last 10 sessions
                    allSessions: data.sessions.length
                };
            }

            getChartData(days = 7) {
                const data = this.getData();
                const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
                
                // Group sessions by day
                const dailyData = {};
                
                // Initialize all days with zero values
                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
                    const dateKey = date.toISOString().split('T')[0];
                    dailyData[dateKey] = {
                        date: dateKey,
                        visits: 0,
                        uniqueVisitors: new Set(),
                        totalDuration: 0
                    };
                }
                
                // Populate with actual session data
                data.sessions.forEach(session => {
                    if (session.startTime >= cutoffTime) {
                        const date = new Date(session.startTime).toISOString().split('T')[0];
                        if (dailyData[date]) {
                            dailyData[date].visits++;
                            dailyData[date].uniqueVisitors.add(session.visitorId);
                            dailyData[date].totalDuration += session.duration;
                        }
                    }
                });
                
                // Convert to arrays for Chart.js
                const sortedDates = Object.keys(dailyData).sort();
                const labels = sortedDates.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                
                const visits = sortedDates.map(date => dailyData[date].visits);
                const uniqueVisitors = sortedDates.map(date => dailyData[date].uniqueVisitors.size);
                const avgDuration = sortedDates.map(date => {
                    const day = dailyData[date];
                    return day.visits > 0 ? Math.round((day.totalDuration / day.visits) / 1000) : 0;
                });
                
                return {
                    labels,
                    datasets: [visits, uniqueVisitors, avgDuration]
                };
            }

            clearAllData() {
                localStorage.removeItem(this.storageKey);
                localStorage.removeItem(this.visitorKey);
                sessionStorage.removeItem(this.sessionKey);
                console.log('All analytics data cleared');
                location.reload(); // Restart tracking with fresh data
            }

            getStorageSize() {
                try {
                    const data = localStorage.getItem(this.storageKey);
                    return data ? Math.round(new Blob([data]).size / 1024) : 0; // Size in KB
                } catch (e) {
                    return 0;
                }
            }

            setupEventListeners() {
                // Track custom events
                window.trackEvent = (eventName, eventData = {}) => {
                    console.log('Custom event tracked:', eventName, eventData);
                    // You can extend this to store custom events
                };
            }
        }

        // Initialize analytics
        const analytics = new ClientSideAnalytics();

        // Dashboard controller
        class Dashboard {
            constructor() {
                this.currentRange = '7d';
                this.chart = null;
                this.updateInterval = null;
                this.init();
            }

            init() {
                this.initChart();
                this.setupEventListeners();
                this.updateDashboard();
                this.startAutoUpdate();
            }

            getRangeInDays(range) {
                const ranges = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
                return ranges[range] || 7;
            }

            updateDashboard() {
                const days = this.getRangeInDays(this.currentRange);
                const data = analytics.getAnalytics(days);
                
                // Update metrics
                document.getElementById('totalVisits').textContent = data.totalSessions.toLocaleString();
                document.getElementById('uniqueVisitors').textContent = data.uniqueVisitors.toLocaleString();
                document.getElementById('dailyAverage').textContent = data.dailyAverage.toLocaleString();
                document.getElementById('bounceRate').textContent = `${data.bounceRate}%`;
                document.getElementById('avgSession').textContent = `${data.avgSessionDuration}s`;
                document.getElementById('storageUsed').textContent = `${analytics.getStorageSize()}KB`;

                // Update status info
                document.getElementById('totalSessions').textContent = data.allSessions.toLocaleString();
                document.getElementById('dataStatus').textContent = `${data.allSessions} sessions stored locally since installation`;

                // Update change indicators
                const growthRate = Math.min(Math.round((data.totalSessions / days) * 10), 99);
                document.getElementById('totalVisitsChange').textContent = `${growthRate}% active growth`;
                document.getElementById('uniqueVisitorsChange').textContent = `${data.uniqueVisitors} distinct visitors`;
                
                if (data.bounceRate > 70) {
                    document.getElementById('bounceRateChange').textContent = 'High bounce rate';
                } else if (data.bounceRate > 50) {
                    document.getElementById('bounceRateChange').textContent = 'Moderate bounce rate';
                } else {
                    document.getElementById('bounceRateChange').textContent = 'Low bounce rate';
                }

                // Update chart
                this.updateChart();
                
                // Update recent sessions
                this.updateRecentSessions(data.recentSessions);
                
                // Update date range
                const endDate = new Date().toLocaleDateString();
                const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000)).toLocaleDateString();
                document.getElementById('chartDateRange').textContent = `${startDate} - ${endDate}`;
                
                // Update sync time
                document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
            }

            initChart() {
                const ctx = document.getElementById('advancedChart').getContext('2d');
                
                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Daily Visits',
                            data: [],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: false
                        }, {
                            label: 'Unique Visitors',
                            data: [],
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4,
                            fill: false
                        }, {
                            label: 'Avg Session Duration (s)',
                            data: [],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                titleColor: '#F8FAFC',
                                bodyColor: '#CBD5E1',
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                borderWidth: 1,
                                cornerRadius: 12
                            }
                        },
                        scales: {
                            x: {
                                ticks: { color: '#94A3B8' },
                                grid: { color: 'rgba(71, 85, 105, 0.3)', drawBorder: false }
                            },
                            y: {
                                ticks: { color: '#94A3B8' },
                                grid: { color: 'rgba(71, 85, 105, 0.3)', drawBorder: false }
                            }
                        }
                    }
                });
            }

            updateChart() {
                const days = this.getRangeInDays(this.currentRange);
                const chartData = analytics.getChartData(days);
                
                this.chart.data.labels = chartData.labels;
                this.chart.data.datasets[0].data = chartData.datasets[0];
                this.chart.data.datasets[1].data = chartData.datasets[1];
                this.chart.data.datasets[2].data = chartData.datasets[2];
                this.chart.update();
            }

            updateRecentSessions(sessions) {
                const container = document.getElementById('recentSessions');
                
                if (sessions.length === 0) {
                    container.innerHTML = `
                        <div class="text-center text-slate-400 py-8">
                            No sessions recorded yet. Start browsing to see data!
                        </div>
                    `;
                    return;
                }

                container.innerHTML = sessions.map(session => {
                    const duration = Math.round(session.duration / 1000);
                    const timeAgo = this.getTimeAgo(session.startTime);
                    const isCurrentSession = session.id === analytics.currentSession?.id;
                    
                    return `
                        <div class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 ${isCurrentSession ? 'border-green-500/50 bg-green-500/5' : ''}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-2 h-2 ${isCurrentSession ? 'bg-green-400' : 'bg-blue-400'} rounded-full ${isCurrentSession ? 'animate-pulse' : ''}"></div>
                                    <div>
                                        <div class="text-white text-sm font-medium">
                                            ${session.visitorId.substring(0, 12)}...
                                            ${isCurrentSession ? '<span class="text-green-400 text-xs ml-2">CURRENT</span>' : ''}
                                        </div>
                                        <div class="text-slate-400 text-xs">${timeAgo}</div>
                                    </div>
                                </div>
                                <div class="text-right text-sm">
                                    <div class="text-white">${duration}s duration</div>
                                    <div class="text-slate-400 text-xs">${session.clicks} clicks • ${session.scrollDepth}% scroll</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            getTimeAgo(timestamp) {
                const now = Date.now();
                const diff = now - timestamp;
                
                if (diff < 60000) return 'Just now';
                if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
                if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
                return `${Math.floor(diff / 86400000)} days ago`;
            }

            setupEventListeners() {
                // Time range buttons
                document.querySelectorAll('.time-range-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        // Update active state
                        document.querySelectorAll('.time-range-btn').forEach(b => {
                            b.classList.remove('time-range-active', 'text-white');
                            b.classList.add('text-slate-400');
                        });
                        e.target.classList.add('time-range-active', 'text-white');
                        e.target.classList.remove('text-slate-400');
                        
                        // Update range and refresh
                        this.currentRange = e.target.dataset.range;
                        this.updateDashboard();
                    });
                });
            }

            startAutoUpdate() {
                // Update every 5 seconds to show live current session data
                this.updateInterval = setInterval(() => {
                    this.updateDashboard();
                }, 5000);
            }

            stopAutoUpdate() {
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
            }
        }

        // Global functions
        window.refreshData = function() {
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = `
                <svg class="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="font-medium">Refreshing...</span>
            `;
            
            dashboard.updateDashboard();
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1000);
        };

        window.exportData = function() {
            const data = analytics.getData();
            const exportData = {
                timestamp: new Date().toISOString(),
                analytics: data,
                summary: analytics.getAnalytics(365), // Full year summary
                chartData: analytics.getChartData(365),
                version: '1.0',
                exportType: 'ak-energy-intelligence-client-side'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ak-analytics-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        window.clearAllData = function() {
            if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
                analytics.clearAllData();
            }
        };

        // Initialize dashboard
        let dashboard;
        document.addEventListener('DOMContentLoaded', () => {
            dashboard = new Dashboard();
            
            // Add entrance animations
            setTimeout(() => {
                document.querySelectorAll('.metric-card').forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.6s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, 100);
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                dashboard?.stopAutoUpdate();
            } else {
                dashboard?.startAutoUpdate();
                dashboard?.updateDashboard();
            }
        });
    </script>
</body>
</html>
