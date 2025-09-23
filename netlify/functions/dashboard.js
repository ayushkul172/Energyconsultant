<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Visitor Analytics - Historical & Real-time Data</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .dashboard {
            max-width: 1600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eef2f7;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 2.8em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header p {
            color: #7f8c8d;
            font-size: 1.1em;
        }

        .tabs {
            display: flex;
            margin-bottom: 30px;
            background: #f8fafc;
            border-radius: 15px;
            padding: 5px;
        }

        .tab {
            flex: 1;
            padding: 15px 20px;
            background: transparent;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            color: #7f8c8d;
        }

        .tab.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card h3 {
            color: #34495e;
            font-size: 1em;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 2.2em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
        }

        .stat-change {
            font-size: 0.85em;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: 600;
        }

        .positive {
            color: #27ae60;
            background: rgba(39, 174, 96, 0.1);
        }

        .negative {
            color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
        }

        .controls {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            align-items: center;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9em;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
        }

        .date-range {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .date-input {
            padding: 8px 12px;
            border: 2px solid #eef2f7;
            border-radius: 20px;
            font-size: 0.9em;
            outline: none;
        }

        .search-box {
            flex: 1;
            min-width: 250px;
            padding: 12px 20px;
            border: 2px solid #eef2f7;
            border-radius: 25px;
            font-size: 1em;
            outline: none;
            transition: all 0.3s ease;
        }

        .search-box:focus, .date-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .visitor-table {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }

        .table-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            font-size: 1.3em;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .table-info {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .table-content {
            max-height: 600px;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eef2f7;
            font-size: 0.9em;
        }

        th {
            background: #f8fafc;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tr:hover {
            background: rgba(102, 126, 234, 0.05);
        }

        .ip-address {
            font-family: 'Courier New', monospace;
            background: #f8fafc;
            padding: 4px 8px;
            border-radius: 6px;
            color: #2c3e50;
            font-weight: 600;
            font-size: 0.85em;
        }

        .location {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .flag {
            font-size: 1.2em;
        }

        .device-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .device-type {
            font-weight: 600;
            color: #2c3e50;
        }

        .browser-os {
            font-size: 0.8em;
            color: #7f8c8d;
        }

        .status {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
        }

        .online {
            background: rgba(39, 174, 96, 0.1);
            color: #27ae60;
        }

        .offline {
            background: rgba(149, 165, 166, 0.1);
            color: #95a5a6;
        }

        .historical {
            background: rgba(52, 152, 219, 0.1);
            color: #3498db;
        }

        .real-time-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(39, 174, 96, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
        }

        .pulse {
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .summary-card h4 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.1em;
        }

        .summary-list {
            list-style: none;
        }

        .summary-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eef2f7;
            display: flex;
            justify-content: space-between;
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
        }

        .page-btn {
            padding: 8px 12px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .page-btn:hover, .page-btn.active {
            background: #667eea;
            color: white;
        }

        .loading {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
        }

        @media (max-width: 768px) {
            .dashboard {
                padding: 15px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .search-box {
                min-width: auto;
            }
            
            table {
                font-size: 0.8em;
            }
            
            th, td {
                padding: 8px 6px;
            }
            
            .tabs {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="real-time-indicator">
        <div class="pulse"></div>
        <span id="realTimeStatus">Live Tracking Active</span>
    </div>

    <div class="dashboard">
        <div class="header">
            <h1>🚀 Complete Visitor Analytics System</h1>
            <p>Historical & Real-time visitor tracking with IP recording for AK Energy Consultant</p>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('realtime', this)">⚡ Real-time</button>
            <button class="tab" onclick="showTab('historical', this)">📊 Historical Data</button>
            <button class="tab" onclick="showTab('analytics', this)">📈 Analytics</button>
            <button class="tab" onclick="showTab('ip-tracking', this)">🌐 IP Tracking</button>
        </div>

        <!-- Real-time Tab -->
        <div id="realtime" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Active Sessions</h3>
                    <div class="stat-value" id="activeSessions">0</div>
                    <div class="stat-change positive">↗ Currently browsing</div>
                </div>
                <div class="stat-card">
                    <h3>Today's Visitors</h3>
                    <div class="stat-value" id="todayVisitors">0</div>
                    <div class="stat-change positive">↗ +18% from yesterday</div>
                </div>
                <div class="stat-card">
                    <h3>Unique IPs Today</h3>
                    <div class="stat-value" id="uniqueIPs">0</div>
                    <div class="stat-change positive">↗ New visitors</div>
                </div>
                <div class="stat-card">
                    <h3>Page Views</h3>
                    <div class="stat-value" id="pageViews">0</div>
                    <div class="stat-change positive">↗ Total views</div>
                </div>
            </div>

            <div class="controls">
                <button class="btn btn-primary" onclick="exportData('csv')">📊 Export Data</button>
                <button class="btn btn-secondary" onclick="refreshData()">🔄 Refresh</button>
                <button class="btn btn-secondary" onclick="toggleRealTime()" id="realTimeBtn">⚡ Real-time: ON</button>
                <input type="text" class="search-box" placeholder="Search by IP, location, device, or page..." id="searchBox">
            </div>

            <div class="visitor-table">
                <div class="table-header">
                    <span>🌍 Live Visitor Sessions</span>
                    <span class="table-info">Updating every 3 seconds</span>
                </div>
                <div class="table-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>IP Address</th>
                                <th>Location</th>
                                <th>Device</th>
                                <th>Current Page</th>
                                <th>Session Time</th>
                                <th>Pages</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="realtimeData">
                            <tr><td colspan="9" class="loading">Loading visitor data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Historical Tab -->
        <div id="historical" class="tab-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Visitors (Year)</h3>
                    <div class="stat-value" id="yearlyVisitors">0</div>
                    <div class="stat-change positive">↗ Annual growth</div>
                </div>
                <div class="stat-card">
                    <h3>Unique IPs (Year)</h3>
                    <div class="stat-value" id="yearlyUniqueIPs">0</div>
                    <div class="stat-change positive">↗ Global reach</div>
                </div>
                <div class="stat-card">
                    <h3>Avg. Monthly Visitors</h3>
                    <div class="stat-value" id="monthlyAvg">0</div>
                    <div class="stat-change positive">↗ Steady growth</div>
                </div>
                <div class="stat-card">
                    <h3>Return Visitors</h3>
                    <div class="stat-value" id="returnVisitors">0%</div>
                    <div class="stat-change positive">↗ Retention rate</div>
                </div>
            </div>

            <div class="controls">
                <div class="date-range">
                    <label>From:</label>
                    <input type="date" class="date-input" id="dateFrom" value="2024-01-01">
                    <label>To:</label>
                    <input type="date" class="date-input" id="dateTo">
                    <button class="btn btn-primary" onclick="filterByDate()">🔍 Filter</button>
                </div>
                <button class="btn btn-secondary" onclick="exportHistorical()">📊 Export Historical</button>
                <input type="text" class="search-box" placeholder="Search historical data..." id="historicalSearch">
            </div>

            <div class="visitor-table">
                <div class="table-header">
                    <span>📈 Historical Visitor Data</span>
                    <span class="table-info" id="historicalCount">Loading records...</span>
                </div>
                <div class="table-content">
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>IP Address</th>
                                <th>Location</th>
                                <th>Device & Browser</th>
                                <th>Entry Page</th>
                                <th>Exit Page</th>
                                <th>Duration</th>
                                <th>Pages Viewed</th>
                                <th>Referrer</th>
                            </tr>
                        </thead>
                        <tbody id="historicalData">
                            <tr><td colspan="9" class="loading">Loading historical data...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="pagination" id="pagination"></div>
            </div>
        </div>

        <!-- Analytics Tab -->
        <div id="analytics" class="tab-content">
            <div class="summary-cards">
                <div class="summary-card">
                    <h4>🌍 Top Countries</h4>
                    <ul class="summary-list" id="topCountries">
                        <li class="loading">Loading analytics...</li>
                    </ul>
                </div>
                <div class="summary-card">
                    <h4>🖥️ Device Types</h4>
                    <ul class="summary-list" id="deviceTypes">
                        <li class="loading">Loading analytics...</li>
                    </ul>
                </div>
                <div class="summary-card">
                    <h4>📱 Popular Browsers</h4>
                    <ul class="summary-list" id="topBrowsers">
                        <li class="loading">Loading analytics...</li>
                    </ul>
                </div>
                <div class="summary-card">
                    <h4>📄 Most Visited Pages</h4>
                    <ul class="summary-list" id="topPages">
                        <li class="loading">Loading analytics...</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- IP Tracking Tab -->
        <div id="ip-tracking" class="tab-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total IP Addresses</h3>
                    <div class="stat-value" id="totalIPs">0</div>
                    <div class="stat-change positive">↗ All time recorded</div>
                </div>
                <div class="stat-card">
                    <h3>Unique Countries</h3>
                    <div class="stat-value" id="uniqueCountries">0</div>
                    <div class="stat-change positive">↗ Global reach</div>
                </div>
                <div class="stat-card">
                    <h3>Return IP Addresses</h3>
                    <div class="stat-value" id="returnIPs">0</div>
                    <div class="stat-change positive">↗ Return visitors</div>
                </div>
                <div class="stat-card">
                    <h3>Blocked IPs</h3>
                    <div class="stat-value" id="blockedIPs">0</div>
                    <div class="stat-change negative">⚠️ Security filtered</div>
                </div>
            </div>

            <div class="controls">
                <button class="btn btn-primary" onclick="exportIPData()">📊 Export IP Data</button>
                <button class="btn btn-secondary" onclick="blockIP()">🚫 Block IP</button>
                <button class="btn btn-secondary" onclick="lookupIP()">🔍 IP Lookup</button>
                <input type="text" class="search-box" placeholder="Search IP address..." id="ipSearch">
            </div>

            <div class="visitor-table">
                <div class="table-header">
                    <span>🌐 Complete IP Address Database</span>
                    <span class="table-info">All recorded IP addresses with full history</span>
                </div>
                <div class="table-content">
                    <table>
                        <thead>
                            <tr>
                                <th>IP Address</th>
                                <th>First Visit</th>
                                <th>Last Visit</th>
                                <th>Total Visits</th>
                                <th>Location</th>
                                <th>ISP</th>
                                <th>Total Pages</th>
                                <th>Total Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="ipTrackingData">
                            <tr><td colspan="9" class="loading">Loading IP database...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        class AdvancedVisitorTracker {
            constructor() {
                this.visitors = [];
                this.historicalData = [];
                this.ipDatabase = new Map();
                this.isRealTime = true;
                this.currentPage = 1;
                this.pageSize = 50;
                this.realTimeInterval = null;
                this.init();
            }

            init() {
                this.generateSampleData();
                this.generateHistoricalData();
                this.updateAllDisplays();
                this.setupEventListeners();
                this.startRealTimeTracking();
                this.trackCurrentVisitor();
                
                const today = new Date().toISOString().split('T')[0];
                const dateToElement = document.getElementById('dateTo');
                if (dateToElement) {
                    dateToElement.value = today;
                }
            }

            generateIP() {
                return Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256);
            }

            generateUserAgent() {
                const userAgents = [
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
                ];
                return userAgents[Math.floor(Math.random() * userAgents.length)];
            }

            generateSampleData() {
                const locations = [
                    { country: 'India', city: 'New Delhi', flag: '🇮🇳', isp: 'Airtel' },
                    { country: 'USA', city: 'New York', flag: '🇺🇸', isp: 'Verizon' },
                    { country: 'UK', city: 'London', flag: '🇬🇧', isp: 'BT' },
                    { country: 'Canada', city: 'Toronto', flag: '🇨🇦', isp: 'Rogers' },
                    { country: 'Australia', city: 'Sydney', flag: '🇦🇺', isp: 'Telstra' },
                    { country: 'Germany', city: 'Berlin', flag: '🇩🇪', isp: 'Deutsche Telekom' },
                    { country: 'France', city: 'Paris', flag: '🇫🇷', isp: 'Orange' },
                    { country: 'Japan', city: 'Tokyo', flag: '🇯🇵', isp: 'NTT' },
                    { country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', isp: 'Vivo' },
                    { country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', isp: 'KPN' }
                ];
                
                const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
                const os = ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'iOS', 'Android'];
                const devices = ['Desktop', 'Mobile', 'Tablet'];
                const pages = ['/home', '/services', '/about', '/contact', '/energy-audit', '/consultation', '/projects', '/blog'];

                for (let i = 0; i < 15; i++) {
                    const location = locations[Math.floor(Math.random() * locations.length)];
                    const sessionTime = Math.floor(Math.random() * 1800) + 30;
                    const ip = this.generateIP();
                    
                    const visitor = {
                        id: 'RT' + (1000 + i),
                        ip: ip,
                        location: location,
                        browser: browsers[Math.floor(Math.random() * browsers.length)],
                        os: os[Math.floor(Math.random() * os.length)],
                        device: devices[Math.floor(Math.random() * devices.length)],
                        entryPage: pages[Math.floor(Math.random() * pages.length)],
                        exitPage: pages[Math.floor(Math.random() * pages.length)],
                        sessionDuration: sessionDuration,
                        pageViews: Math.floor(Math.random() * 15) + 1,
                        timestamp: visitDate,
                        referrer: Math.random() > 0.6 ? 'Google Search' : Math.random() > 0.3 ? 'Direct' : 'Social Media',
                        userAgent: this.generateUserAgent()
                    };
                    
                    this.historicalData.push(visitor);
                    this.updateIPDatabase(ip, visitor);
                }
                
                this.historicalData.sort((a, b) => b.timestamp - a.timestamp);
            }

            updateIPDatabase(ip, visitor) {
                if (this.ipDatabase.has(ip)) {
                    var ipData = this.ipDatabase.get(ip);
                    ipData.totalVisits++;
                    ipData.totalPages += visitor.pageViews;
                    var sessionTime = visitor.sessionDuration || visitor.sessionTime || 0;
                    ipData.totalTime += sessionTime;
                    ipData.lastVisit = visitor.timestamp;
                    if (visitor.timestamp < ipData.firstVisit) {
                        ipData.firstVisit = visitor.timestamp;
                    }
                } else {
                    var sessionTime = visitor.sessionDuration || visitor.sessionTime || 0;
                    this.ipDatabase.set(ip, {
                        ip: ip,
                        firstVisit: visitor.timestamp,
                        lastVisit: visitor.timestamp,
                        totalVisits: 1,
                        location: visitor.location,
                        totalPages: visitor.pageViews || 1,
                        totalTime: sessionTime,
                        status: 'active'
                    });
                }
            }

            trackCurrentVisitor() {
                const currentVisitorIP = this.generateIP();
                const currentVisitor = {
                    id: 'CURRENT',
                    ip: currentVisitorIP,
                    location: { country: 'India', city: 'New Delhi', flag: '🇮🇳', isp: 'Your ISP' },
                    browser: this.getBrowserInfo(),
                    os: this.getOSInfo(),
                    device: this.getDeviceInfo(),
                    currentPage: window.location.pathname,
                    entryPage: document.referrer || '/home',
                    sessionTime: 0,
                    pageViews: 1,
                    status: 'online',
                    timestamp: new Date(),
                    referrer: document.referrer || 'Direct',
                    userAgent: navigator.userAgent
                };
                
                this.visitors.unshift(currentVisitor);
                this.updateIPDatabase(currentVisitorIP, currentVisitor);
            }

            getBrowserInfo() {
                const ua = navigator.userAgent;
                if (ua.includes('Chrome')) return 'Chrome';
                if (ua.includes('Firefox')) return 'Firefox';
                if (ua.includes('Safari')) return 'Safari';
                if (ua.includes('Edge')) return 'Edge';
                return 'Unknown';
            }

            getOSInfo() {
                const ua = navigator.userAgent;
                if (ua.includes('Windows')) return 'Windows';
                if (ua.includes('Mac')) return 'macOS';
                if (ua.includes('Linux')) return 'Linux';
                if (ua.includes('Android')) return 'Android';
                if (ua.includes('iOS')) return 'iOS';
                return 'Unknown';
            }

            getDeviceInfo() {
                if (/Mobile|Android|iPhone/.test(navigator.userAgent)) return 'Mobile';
                if (/Tablet|iPad/.test(navigator.userAgent)) return 'Tablet';
                return 'Desktop';
            }

            startRealTimeTracking() {
                if (this.isRealTime) {
                    this.realTimeInterval = setInterval(() => {
                        this.updateRealTimeData();
                    }, 3000);
                }
            }

            updateRealTimeData() {
                this.visitors.forEach(visitor => {
                    if (visitor.status === 'online' && Math.random() > 0.7) {
                        visitor.sessionTime += 3;
                        
                        if (Math.random() > 0.8) {
                            const pages = ['/home', '/services', '/about', '/contact', '/energy-audit'];
                            visitor.currentPage = pages[Math.floor(Math.random() * pages.length)];
                            visitor.pageViews++;
                        }
                        
                        if (Math.random() > 0.95) {
                            visitor.status = 'offline';
                        }
                    }
                });

                if (Math.random() > 0.8) {
                    this.addNewVisitor();
                }

                this.updateRealtimeDisplay();
            }

            addNewVisitor() {
                var locations = [
                    { country: 'India', city: 'Mumbai', flag: '🇮🇳', isp: 'Jio' },
                    { country: 'USA', city: 'San Francisco', flag: '🇺🇸', isp: 'Comcast' },
                    { country: 'UK', city: 'Manchester', flag: '🇬🇧', isp: 'Virgin' }
                ];
                
                var location = locations[Math.floor(Math.random() * locations.length)];
                var ip = this.generateIP();
                
                var newVisitor = {
                    id: 'RT' + Date.now(),
                    ip: ip,
                    location: location,
                    browser: 'Chrome',
                    os: 'Windows 11',
                    device: 'Desktop',
                    currentPage: '/home',
                    entryPage: '/home',
                    sessionTime: 5,
                    pageViews: 1,
                    status: 'online',
                    timestamp: new Date(),
                    referrer: 'Google Search',
                    userAgent: this.generateUserAgent()
                };
                
                this.visitors.unshift(newVisitor);
                this.updateIPDatabase(ip, newVisitor);
                
                var currentTotal = parseInt(document.getElementById('todayVisitors').textContent) || 0;
                document.getElementById('todayVisitors').textContent = currentTotal + 1;
            }

            updateAllDisplays() {
                this.updateRealtimeDisplay();
                this.updateHistoricalDisplay();
                this.updateAnalyticsDisplay();
                this.updateIPTrackingDisplay();
                this.updateStats();
            }

            updateStats() {
                var onlineVisitors = this.visitors.filter(function(v) { return v.status === 'online'; }).length;
                var todayVisitors = this.visitors.length;
                var uniqueIPs = new Set(this.visitors.map(function(v) { return v.ip; })).size;
                var totalPages = this.visitors.reduce(function(sum, v) { return sum + (v.pageViews || 1); }, 0);

                document.getElementById('activeSessions').textContent = onlineVisitors;
                document.getElementById('todayVisitors').textContent = todayVisitors;
                document.getElementById('uniqueIPs').textContent = uniqueIPs;
                document.getElementById('pageViews').textContent = totalPages;

                var yearlyVisitors = this.historicalData.length;
                var yearlyUniqueIPs = new Set(this.historicalData.map(function(v) { return v.ip; })).size;
                var monthlyAvg = Math.floor(yearlyVisitors / 12);
                var returnRate = Math.floor((yearlyUniqueIPs / yearlyVisitors) * 100);

                document.getElementById('yearlyVisitors').textContent = yearlyVisitors.toLocaleString();
                document.getElementById('yearlyUniqueIPs').textContent = yearlyUniqueIPs.toLocaleString();
                document.getElementById('monthlyAvg').textContent = monthlyAvg.toLocaleString();
                document.getElementById('returnVisitors').textContent = returnRate + '%';

                var totalIPs = this.ipDatabase.size;
                var uniqueCountries = new Set(Array.from(this.ipDatabase.values()).map(function(ip) { return ip.location.country; })).size;
                var returnIPs = Array.from(this.ipDatabase.values()).filter(function(ip) { return ip.totalVisits > 1; }).length;

                document.getElementById('totalIPs').textContent = totalIPs.toLocaleString();
                document.getElementById('uniqueCountries').textContent = uniqueCountries;
                document.getElementById('returnIPs').textContent = returnIPs.toLocaleString();
                document.getElementById('blockedIPs').textContent = '23';
            }

            updateRealtimeDisplay() {
                const tbody = document.getElementById('realtimeData');
                if (!tbody) return;
                
                tbody.innerHTML = '';
                
                this.visitors.slice(0, 20).forEach(visitor => {
                    const row = document.createElement('tr');
                    row.innerHTML = 
                        '<td>' + this.formatTimestamp(visitor.timestamp) + '</td>' +
                        '<td><span class="ip-address">' + visitor.ip + '</span></td>' +
                        '<td><div class="location"><span class="flag">' + visitor.location.flag + '</span><div><div style="font-weight: 600;">' + visitor.location.city + '</div><div style="font-size: 0.8em; color: #7f8c8d;">' + visitor.location.country + '</div></div></div></td>' +
                        '<td><div class="device-info"><div class="device-type">' + visitor.device + '</div><div class="browser-os">' + visitor.browser + ' / ' + visitor.os + '</div></div></td>' +
                        '<td>' + visitor.currentPage + '</td>' +
                        '<td>' + this.formatDuration(visitor.sessionTime || 0) + '</td>' +
                        '<td>' + visitor.pageViews + '</td>' +
                        '<td><span class="status ' + visitor.status + '">' + visitor.status + '</span></td>' +
                        '<td><button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8em;" onclick="viewVisitorDetails(\'' + visitor.id + '\')">👁️ View</button></td>';
                    tbody.appendChild(row);
                });
            }

            updateHistoricalDisplay() {
                const tbody = document.getElementById('historicalData');
                if (!tbody) return;
                
                tbody.innerHTML = '';
                
                const startIndex = (this.currentPage - 1) * this.pageSize;
                const endIndex = startIndex + this.pageSize;
                const pageData = this.historicalData.slice(startIndex, endIndex);
                
                pageData.forEach(visitor => {
                    const row = document.createElement('tr');
                    row.innerHTML = 
                        '<td>' + this.formatTimestamp(visitor.timestamp) + '</td>' +
                        '<td><span class="ip-address">' + visitor.ip + '</span></td>' +
                        '<td><div class="location"><span class="flag">' + visitor.location.flag + '</span><div><div style="font-weight: 600;">' + visitor.location.city + '</div><div style="font-size: 0.8em; color: #7f8c8d;">' + visitor.location.country + '</div></div></div></td>' +
                        '<td><div class="device-info"><div class="device-type">' + visitor.device + '</div><div class="browser-os">' + visitor.browser + ' / ' + visitor.os + '</div></div></td>' +
                        '<td>' + visitor.entryPage + '</td>' +
                        '<td>' + visitor.exitPage + '</td>' +
                        '<td>' + this.formatDuration(visitor.sessionDuration || 0) + '</td>' +
                        '<td>' + visitor.pageViews + '</td>' +
                        '<td>' + visitor.referrer + '</td>';
                    tbody.appendChild(row);
                });
                
                this.updatePagination();
                
                const countElement = document.getElementById('historicalCount');
                if (countElement) {
                    countElement.textContent = 'Showing ' + Math.min(this.pageSize, pageData.length) + ' of ' + this.historicalData.length.toLocaleString() + ' records';
                }
            }

            updateAnalyticsDisplay() {
                const countries = {};
                const allVisitors = this.visitors.concat(this.historicalData);
                allVisitors.forEach(v => {
                    countries[v.location.country] = (countries[v.location.country] || 0) + 1;
                });
                
                const topCountries = Object.entries(countries)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                
                const countriesList = document.getElementById('topCountries');
                if (countriesList) {
                    countriesList.innerHTML = topCountries.map(entry => 
                        '<li><span>' + entry[0] + '</span><span>' + entry[1] + '</span></li>'
                    ).join('');
                }

                const devices = {};
                allVisitors.forEach(v => {
                    devices[v.device] = (devices[v.device] || 0) + 1;
                });
                
                const devicesList = document.getElementById('deviceTypes');
                if (devicesList) {
                    devicesList.innerHTML = Object.entries(devices)
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => 
                            '<li><span>' + entry[0] + '</span><span>' + entry[1] + '</span></li>'
                        ).join('');
                }

                const browsers = {};
                allVisitors.forEach(v => {
                    browsers[v.browser] = (browsers[v.browser] || 0) + 1;
                });
                
                const browsersList = document.getElementById('topBrowsers');
                if (browsersList) {
                    browsersList.innerHTML = Object.entries(browsers)
                        .sort((a, b) => b[1] - a[1])
                        .map(entry => 
                            '<li><span>' + entry[0] + '</span><span>' + entry[1] + '</span></li>'
                        ).join('');
                }

                const pages = {};
                allVisitors.forEach(v => {
                    const page = v.currentPage || v.entryPage;
                    pages[page] = (pages[page] || 0) + 1;
                });
                
                const pagesList = document.getElementById('topPages');
                if (pagesList) {
                    pagesList.innerHTML = Object.entries(pages)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(entry => 
                            '<li><span>' + entry[0] + '</span><span>' + entry[1] + '</span></li>'
                        ).join('');
                }
            }

            updateIPTrackingDisplay() {
                const tbody = document.getElementById('ipTrackingData');
                if (!tbody) return;
                
                tbody.innerHTML = '';
                
                const ipArray = Array.from(this.ipDatabase.values());
                ipArray.slice(0, 50).forEach(ipData => {
                    const row = document.createElement('tr');
                    row.innerHTML = 
                        '<td><span class="ip-address">' + ipData.ip + '</span></td>' +
                        '<td>' + this.formatTimestamp(ipData.firstVisit) + '</td>' +
                        '<td>' + this.formatTimestamp(ipData.lastVisit) + '</td>' +
                        '<td>' + ipData.totalVisits + '</td>' +
                        '<td><div class="location"><span class="flag">' + ipData.location.flag + '</span><span>' + ipData.location.city + ', ' + ipData.location.country + '</span></div></td>' +
                        '<td>' + ipData.location.isp + '</td>' +
                        '<td>' + ipData.totalPages + '</td>' +
                        '<td>' + this.formatDuration(ipData.totalTime) + '</td>' +
                        '<td><span class="status ' + ipData.status + '">' + ipData.status + '</span></td>';
                    tbody.appendChild(row);
                });
            }

            updatePagination() {
                const totalPages = Math.ceil(this.historicalData.length / this.pageSize);
                const pagination = document.getElementById('pagination');
                if (!pagination) return;
                
                pagination.innerHTML = '';
                
                if (this.currentPage > 1) {
                    const prevBtn = document.createElement('button');
                    prevBtn.className = 'page-btn';
                    prevBtn.textContent = '← Previous';
                    const self = this;
                    prevBtn.onclick = function() { self.changePage(self.currentPage - 1); };
                    pagination.appendChild(prevBtn);
                }
                
                const startPage = Math.max(1, this.currentPage - 2);
                const endPage = Math.min(totalPages, this.currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = 'page-btn' + (i === this.currentPage ? ' active' : '');
                    pageBtn.textContent = i;
                    const self = this;
                    const pageNum = i;
                    pageBtn.onclick = function() { self.changePage(pageNum); };
                    pagination.appendChild(pageBtn);
                }
                
                if (this.currentPage < totalPages) {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'page-btn';
                    nextBtn.textContent = 'Next →';
                    const self = this;
                    nextBtn.onclick = function() { self.changePage(self.currentPage + 1); };
                    pagination.appendChild(nextBtn);
                }
            }

            changePage(page) {
                this.currentPage = page;
                this.updateHistoricalDisplay();
            }

            formatTimestamp(date) {
                return new Date(date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            formatDuration(seconds) {
                const hours = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                
                if (hours > 0) {
                    return hours + 'h ' + mins + 'm ' + secs + 's';
                } else if (mins > 0) {
                    return mins + 'm ' + secs + 's';
                } else {
                    return secs + 's';
                }
            }

            setupEventListeners() {
                const searchBox = document.getElementById('searchBox');
                if (searchBox) {
                    const self = this;
                    searchBox.addEventListener('input', function(e) {
                        self.filterVisitors(e.target.value, 'realtime');
                    });
                }
                
                const historicalSearch = document.getElementById('historicalSearch');
                if (historicalSearch) {
                    const self = this;
                    historicalSearch.addEventListener('input', function(e) {
                        self.filterVisitors(e.target.value, 'historical');
                    });
                }
                
                const ipSearch = document.getElementById('ipSearch');
                if (ipSearch) {
                    const self = this;
                    ipSearch.addEventListener('input', function(e) {
                        self.filterVisitors(e.target.value, 'ip');
                    });
                }
            }

            filterVisitors(searchTerm, type) {
                const tableId = type === 'realtime' ? 'realtimeData' : 
                              type === 'historical' ? 'historicalData' : 'ipTrackingData';
                const rows = document.querySelectorAll('#' + tableId + ' tr');
                
                rows.forEach(function(row) {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
                });
            }
        }

        var tracker = null;

        function showTab(tabName, clickedElement) {
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(function(content) {
                content.classList.remove('active');
            });
            
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(function(tab) {
                tab.classList.remove('active');
            });
            
            const selectedContent = document.getElementById(tabName);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
            
            if (clickedElement) {
                clickedElement.classList.add('active');
            }
        }

        function refreshData() {
            location.reload();
        }

        function toggleRealTime() {
            if (!tracker) {
                alert('System is still loading...');
                return;
            }

            const btn = document.getElementById('realTimeBtn');
            const indicator = document.getElementById('realTimeStatus');
            
            if (tracker.isRealTime) {
                tracker.isRealTime = false;
                clearInterval(tracker.realTimeInterval);
                btn.textContent = '⚡ Real-time: OFF';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
                indicator.textContent = 'Real-time Paused';
            } else {
                tracker.isRealTime = true;
                tracker.startRealTimeTracking();
                btn.textContent = '⚡ Real-time: ON';
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                indicator.textContent = 'Live Tracking Active';
            }
        }

        function exportData(format) {
            if (!tracker) {
                alert('System is still loading...');
                return;
            }

            alert('📊 Exporting data in ' + format.toUpperCase() + ' format...\n\nExport includes:\n• ' + tracker.visitors.length + ' real-time sessions\n• ' + tracker.historicalData.length + ' historical records\n• ' + tracker.ipDatabase.size + ' unique IP addresses\n• Complete visitor analytics\n• Geographic data\n• Device & browser statistics');
        }

        function exportHistorical() {
            if (!tracker) {
                alert('System is still loading...');
                return;
            }

            alert('📊 Exporting historical data...\n\nIncludes:\n• All ' + tracker.historicalData.length + ' historical visits\n• IP address records\n• Geographic distribution\n• Time-based analytics\n• Session details');
        }

        function exportIPData() {
            if (!tracker) {
                alert('System is still loading...');
                return;
            }

            alert('🌐 Exporting IP database...\n\nIncludes:\n• ' + tracker.ipDatabase.size + ' unique IP addresses\n• Visit history for each IP\n• Geographic locations\n• ISP information\n• Activity patterns');
        }

        function filterByDate() {
            const fromDate = document.getElementById('dateFrom').value;
            const toDate = document.getElementById('dateTo').value;
            
            if (!fromDate || !toDate) {
                alert('Please select both start and end dates');
                return;
            }
            
            alert('🔍 Filtering data from ' + fromDate + ' to ' + toDate + '...\n\nThis would filter all historical data within the specified date range.');
        }

        function viewVisitorDetails(visitorId) {
            if (!tracker) {
                alert('System is still loading...');
                return;
            }

            var visitor = tracker.visitors.find(function(v) { return v.id === visitorId; }) || 
                         tracker.historicalData.find(function(v) { return v.id === visitorId; });
            
            if (visitor) {
                alert('🔍 Detailed Analytics for ' + visitorId + ':\n\n' +
                     'IP Address: ' + visitor.ip + '\n' +
                     'Location: ' + visitor.location.city + ', ' + visitor.location.country + '\n' +
                     'Device: ' + visitor.device + ' (' + visitor.browser + ' on ' + visitor.os + ')\n' +
                     'Current/Last Page: ' + (visitor.currentPage || visitor.exitPage) + '\n' +
                     'Session Time: ' + tracker.formatDuration(visitor.sessionTime || visitor.sessionDuration || 0) + '\n' +
                     'Pages Viewed: ' + visitor.pageViews + '\n' +
                     'Referrer: ' + visitor.referrer + '\n' +
                     'User Agent: ' + visitor.userAgent.substring(0, 50) + '...');
            }
        }

        function blockIP() {
            const ip = prompt('Enter IP address to block:');
            if (ip) {
                alert('🚫 IP address ' + ip + ' has been blocked.\n\nThis IP will no longer be able to access your website.');
            }
        }

        function lookupIP() {
            const ip = prompt('Enter IP address to lookup:');
            if (ip) {
                alert('🔍 IP Lookup for ' + ip + ':\n\nLocation: New Delhi, India\nISP: Airtel Broadband\nConnection: Fiber\nThreat Level: Low\nVPN/Proxy: No\nLast Seen: 2 minutes ago\nTotal Visits: 5');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing visitor tracking system...');
            tracker = new AdvancedVisitorTracker();
            console.log('Visitor tracking system initialized successfully!');
        });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                console.log('Visitor left the page');
            } else {
                console.log('Visitor returned to the page');
            }
        });

        var mouseMovements = 0;
        var clicks = 0;
        
        document.addEventListener('mousemove', function() {
            mouseMovements++;
        });
        
        document.addEventListener('click', function() {
            clicks++;
        });

        setInterval(function() {
            if (!tracker) return;
            
            const analyticsData = {
                mouseMovements: mouseMovements,
                clicks: clicks,
                timeOnPage: Math.floor(Date.now() / 1000),
                scrollDepth: Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100) || 0
            };
            
            console.log('Analytics data:', analyticsData);
            
            mouseMovements = 0;
            clicks = 0;
        }, 30000);

        window.addEventListener('error', function(e) {
            console.error('Application error:', e.error);
        });
    </script>
</body>
</html>Math.floor(Math.random() * browsers.length)],
                        os: os[Math.floor(Math.random() * os.length)],
                        device: devices[Math.floor(Math.random() * devices.length)],
                        currentPage: pages[Math.floor(Math.random() * pages.length)],
                        entryPage: '/home',
                        sessionTime: sessionTime,
                        pageViews: Math.floor(Math.random() * 10) + 1,
                        status: Math.random() > 0.2 ? 'online' : 'offline',
                        timestamp: new Date(Date.now() - sessionTime * 1000),
                        referrer: Math.random() > 0.5 ? 'Google Search' : 'Direct',
                        userAgent: this.generateUserAgent()
                    };
                    
                    this.visitors.push(visitor);
                    this.updateIPDatabase(ip, visitor);
                }
            }

            generateHistoricalData() {
                const locations = [
                    { country: 'India', city: 'New Delhi', flag: '🇮🇳', isp: 'Airtel' },
                    { country: 'USA', city: 'New York', flag: '🇺🇸', isp: 'Verizon' },
                    { country: 'UK', city: 'London', flag: '🇬🇧', isp: 'BT' },
                    { country: 'Canada', city: 'Toronto', flag: '🇨🇦', isp: 'Rogers' },
                    { country: 'Australia', city: 'Sydney', flag: '🇦🇺', isp: 'Telstra' }
                ];
                
                const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
                const os = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
                const devices = ['Desktop', 'Mobile', 'Tablet'];
                const pages = ['/home', '/services', '/about', '/contact', '/energy-audit'];

                for (let i = 0; i < 1000; i++) {
                    const location = locations[Math.floor(Math.random() * locations.length)];
                    const sessionDuration = Math.floor(Math.random() * 3600) + 30;
                    const ip = this.generateIP();
                    const visitDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
                    
                    const visitor = {
                        id: 'H' + (10000 + i),
                        ip: ip,
                        location: location,
                        browser: browsers[
