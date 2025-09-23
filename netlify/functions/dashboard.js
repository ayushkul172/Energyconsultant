/**
 * Analytics Dashboard
 * Frontend dashboard for viewing tracking analytics
 * Version: 1.0.0
 */

class AnalyticsDashboard {
    constructor(config = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/analytics',
            refreshInterval: config.refreshInterval || 30000, // 30 seconds
            dateRange: config.dateRange || '7d',
            timezone: config.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            charts: config.charts || true,
            realtime: config.realtime || true,
            ...config
        };

        this.data = {};
        this.charts = {};
        this.refreshTimer = null;
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.createDashboardHTML();
        this.setupEventListeners();
        await this.loadData();
        this.startAutoRefresh();
        
        console.log('Analytics Dashboard initialized');
    }

    // HTML Structure Creation
    createDashboardHTML() {
        const container = document.getElementById('analytics-dashboard') || this.createContainer();
        
        container.innerHTML = `
            <div class="dashboard-header">
                <h1>Website Analytics</h1>
                <div class="dashboard-controls">
                    <select id="date-range-selector">
                        <option value="1d">Last 24 Hours</option>
                        <option value="7d" selected>Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button id="refresh-btn" class="btn-primary">Refresh</button>
                    <button id="export-btn" class="btn-secondary">Export</button>
                </div>
            </div>

            <div class="dashboard-stats">
                <div class="loading-overlay" id="loading-overlay">
                    <div class="spinner"></div>
                </div>
                
                <!-- Key Metrics Cards -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <h3>Total Page Views</h3>
                            <span class="metric-period" id="pageviews-period">Loading...</span>
                        </div>
                        <div class="metric-value" id="total-pageviews">-</div>
                        <div class="metric-change" id="pageviews-change">-</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <h3>Unique Visitors</h3>
                            <span class="metric-period" id="visitors-period">Loading...</span>
                        </div>
                        <div class="metric-value" id="unique-visitors">-</div>
                        <div class="metric-change" id="visitors-change">-</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <h3>Avg. Session Duration</h3>
                            <span class="metric-period" id="duration-period">Loading...</span>
                        </div>
                        <div class="metric-value" id="avg-duration">-</div>
                        <div class="metric-change" id="duration-change">-</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <h3>Bounce Rate</h3>
                            <span class="metric-period" id="bounce-period">Loading...</span>
                        </div>
                        <div class="metric-value" id="bounce-rate">-</div>
                        <div class="metric-change" id="bounce-change">-</div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>Page Views Over Time</h3>
                        <canvas id="pageviews-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Visitors Overview</h3>
                        <canvas id="visitors-chart"></canvas>
                    </div>
                </div>

                <!-- Real-time Section -->
                <div class="realtime-section" id="realtime-section">
                    <h3>Real-time Activity</h3>
                    <div class="realtime-stats">
                        <div class="realtime-metric">
                            <span class="realtime-label">Active Users</span>
                            <span class="realtime-value" id="active-users">0</span>
                        </div>
                        <div class="realtime-metric">
                            <span class="realtime-label">Page Views (last 30 min)</span>
                            <span class="realtime-value" id="recent-pageviews">0</span>
                        </div>
                    </div>
                    <div class="realtime-activity" id="realtime-activity">
                        <!-- Real-time events will be populated here -->
                    </div>
                </div>

                <!-- Detailed Tables -->
                <div class="tables-grid">
                    <div class="table-container">
                        <h3>Top Pages</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Views</th>
                                    <th>Unique</th>
                                    <th>Avg. Time</th>
                                </tr>
                            </thead>
                            <tbody id="top-pages-table">
                                <tr><td colspan="4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-container">
                        <h3>Traffic Sources</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Visitors</th>
                                    <th>Sessions</th>
                                    <th>Conversion %</th>
                                </tr>
                            </thead>
                            <tbody id="traffic-sources-table">
                                <tr><td colspan="4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-container">
                        <h3>Browser & Device Info</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Browser</th>
                                    <th>Users</th>
                                    <th>Device Type</th>
                                    <th>Users</th>
                                </tr>
                            </thead>
                            <tbody id="browser-device-table">
                                <tr><td colspan="4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-container">
                        <h3>Geographic Data</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Visitors</th>
                                    <th>Sessions</th>
                                    <th>Avg. Duration</th>
                                </tr>
                            </thead>
                            <tbody id="geographic-table">
                                <tr><td colspan="4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Events & Conversions -->
                <div class="events-section">
                    <h3>Custom Events</h3>
                    <div class="events-filters">
                        <select id="event-filter">
                            <option value="">All Events</option>
                            <option value="click">Clicks</option>
                            <option value="form_submit">Form Submissions</option>
                            <option value="scroll_milestone">Scroll Milestones</option>
                            <option value="conversion">Conversions</option>
                        </select>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Count</th>
                                <th>Unique Users</th>
                                <th>Last Occurred</th>
                            </tr>
                        </thead>
                        <tbody id="events-table">
                            <tr><td colspan="4">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.addDashboardStyles();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'analytics-dashboard';
        document.body.appendChild(container);
        return container;
    }

    // CSS Styles
    addDashboardStyles() {
        if (document.getElementById('dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-styles';
        styles.textContent = `
            #analytics-dashboard {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
                min-height: 100vh;
            }

            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .dashboard-header h1 {
                margin: 0;
                color: #2c3e50;
                font-size: 28px;
            }

            .dashboard-controls {
                display: flex;
                gap: 10px;
            }

            .dashboard-controls select, .btn-primary, .btn-secondary {
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
            }

            .btn-primary {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
                border-color: #6c757d;
            }

            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .loading-overlay.active {
                display: flex;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .metric-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .metric-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .metric-header h3 {
                margin: 0;
                font-size: 14px;
                color: #6c757d;
                text-transform: uppercase;
                font-weight: 600;
            }

            .metric-period {
                font-size: 12px;
                color: #adb5bd;
            }

            .metric-value {
                font-size: 32px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .metric-change {
                font-size: 14px;
                font-weight: 500;
            }

            .metric-change.positive {
                color: #28a745;
            }

            .metric-change.negative {
                color: #dc3545;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .chart-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .chart-container h3 {
                margin: 0 0 20px 0;
                font-size: 18px;
                color: #2c3e50;
            }

            .realtime-section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }

            .realtime-section h3 {
                margin: 0 0 20px 0;
                color: #2c3e50;
            }

            .realtime-stats {
                display: flex;
                gap: 40px;
                margin-bottom: 20px;
            }

            .realtime-metric {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .realtime-label {
                font-size: 12px;
                color: #6c757d;
                margin-bottom: 5px;
            }

            .realtime-value {
                font-size: 24px;
                font-weight: 700;
                color: #28a745;
            }

            .realtime-activity {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 10px;
            }

            .activity-item {
                padding: 8px 0;
                border-bottom: 1px solid #f8f9fa;
                font-size: 14px;
                color: #495057;
            }

            .activity-item:last-child {
                border-bottom: none;
            }

            .tables-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .table-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .table-container h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                font-size: 18px;
            }

            .data-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            .data-table th {
                background: #f8f9fa;
                padding: 10px 8px;
                text-align: left;
                font-weight: 600;
                color: #495057;
                border-bottom: 2px solid #dee2e6;
            }

            .data-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #dee2e6;
                color: #495057;
            }

            .data-table tbody tr:hover {
                background: #f8f9fa;
            }

            .events-section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .events-section h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
            }

            .events-filters {
                margin-bottom: 20px;
            }

            .events-filters select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }

            @media (max-width: 768px) {
                .dashboard-header {
                    flex-direction: column;
                    gap: 15px;
                }

                .metrics-grid {
                    grid-template-columns: 1fr;
                }

                .charts-grid {
                    grid-template-columns: 1fr;
                }

                .tables-grid {
                    grid-template-columns: 1fr;
                }

                .realtime-stats {
                    flex-direction: column;
                    gap: 20px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Event Listeners
    setupEventListeners() {
        // Date range selector
        const dateRangeSelector = document.getElementById('date-range-selector');
        dateRangeSelector.addEventListener('change', (e) => {
            this.config.dateRange = e.target.value;
            this.loadData();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Event filter
        const eventFilter = document.getElementById('event-filter');
        eventFilter.addEventListener('change', (e) => {
            this.filterEvents(e.target.value);
        });

        // Window visibility change for real-time updates
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
            }
        });
    }

    // Data Loading
    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const [overview, pages, sources, browserDevice, geographic, events, realtime] = await Promise.all([
                this.fetchOverview(),
                this.fetchTopPages(),
                this.fetchTrafficSources(),
                this.fetchBrowserDevice(),
                this.fetchGeographic(),
                this.fetchEvents(),
                this.fetchRealtime()
            ]);

            this.data = {
                overview,
                pages,
                sources,
                browserDevice,
                geographic,
                events,
                realtime
            };

            this.updateDashboard();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async fetchOverview() {
        const response = await fetch(`${this.config.apiEndpoint}/overview?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchTopPages() {
        const response = await fetch(`${this.config.apiEndpoint}/pages?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchTrafficSources() {
        const response = await fetch(`${this.config.apiEndpoint}/sources?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchBrowserDevice() {
        const response = await fetch(`${this.config.apiEndpoint}/browser-device?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchGeographic() {
        const response = await fetch(`${this.config.apiEndpoint}/geographic?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchEvents() {
        const response = await fetch(`${this.config.apiEndpoint}/events?range=${this.config.dateRange}`);
        return response.json();
    }

    async fetchRealtime() {
        const response = await fetch(`${this.config.apiEndpoint}/realtime`);
        return response.json();
    }

    // Dashboard Updates
    updateDashboard() {
        this.updateMetrics();
        this.updateCharts();
        this.updateTables();
        this.updateRealtime();
    }

    updateMetrics() {
        const { overview } = this.data;
        
        // Page views
        document.getElementById('total-pageviews').textContent = this.formatNumber(overview.pageviews || 0);
        document.getElementById('pageviews-period').textContent = this.getPeriodText();
        document.getElementById('pageviews-change').textContent = this.formatChange(overview.pageviewsChange || 0);
        document.getElementById('pageviews-change').className = `metric-change ${this.getChangeClass(overview.pageviewsChange)}`;

        // Unique visitors
        document.getElementById('unique-visitors').textContent = this.formatNumber(overview.uniqueVisitors || 0);
        document.getElementById('visitors-period').textContent = this.getPeriodText();
        document.getElementById('visitors-change').textContent = this.formatChange(overview.visitorsChange || 0);
        document.getElementById('visitors-change').className = `metric-change ${this.getChangeClass(overview.visitorsChange)}`;

        // Average duration
        document.getElementById('avg-duration').textContent = this.formatDuration(overview.avgDuration || 0);
        document.getElementById('duration-period').textContent = this.getPeriodText();
        document.getElementById('duration-change').textContent = this.formatChange(overview.durationChange || 0);
        document.getElementById('duration-change').className = `metric-change ${this.getChangeClass(overview.durationChange)}`;

        // Bounce rate
        document.getElementById('bounce-rate').textContent = this.formatPercentage(overview.bounceRate || 0);
        document.getElementById('bounce-period').textContent = this.getPeriodText();
        document.getElementById('bounce-change').textContent = this.formatChange(overview.bounceChange || 0);
        document.getElementById('bounce-change').className = `metric-change ${this.getChangeClass(overview.bounceChange, true)}`;
    }

    updateCharts() {
        if (!this.config.charts) return;

        // You would implement chart rendering here using a library like Chart.js
        // This is a placeholder implementation
        this.renderPageViewsChart();
        this.renderVisitorsChart();
    }

    renderPageViewsChart() {
        // Placeholder for Chart.js implementation
        const canvas = document.getElementById('pageviews-chart');
        const ctx = canvas.getContext('2d');
        
        // Simple example - replace with actual Chart.js implementation
        ctx.fillStyle = '#007bff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Page Views Chart', 10, 30);
        ctx.fillText('(Chart.js implementation needed)', 10, 50);
    }

    renderVisitorsChart() {
        // Placeholder for Chart.js implementation
        const canvas = document.getElementById('visitors-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#28a745';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Visitors Chart', 10, 30);
        ctx.fillText('(Chart.js implementation needed)', 10, 50);
    }

    updateTables() {
        this.updateTopPagesTable();
        this.updateTrafficSourcesTable();
        this.updateBrowserDeviceTable();
        this.updateGeographicTable();
        this.updateEventsTable();
    }

    updateTopPagesTable() {
        const tbody = document.getElementById('top-pages-table');
        const { pages } = this.data;
        
        tbody.innerHTML = pages.map(page => `
            <tr>
                <td>${page.path}</td>
                <td>${this.formatNumber(page.views)}</td>
                <td>${this.formatNumber(page.uniqueViews)}</td>
                <td>${this.formatDuration(page.avgTime)}</td>
            </tr>
        `).join('');
    }

    updateTrafficSourcesTable() {
        const tbody = document.getElementById('traffic-sources-table');
        const { sources } = this.data;
        
        tbody.innerHTML = sources.map(source => `
            <tr>
                <td>${source.name}</td>
                <td>${this.formatNumber(source.visitors)}</td>
                <td>${this.formatNumber(source.sessions)}</td>
                <td>${this.formatPercentage(source.conversionRate)}</td>
            </tr>
        `).join('');
    }

    updateBrowserDeviceTable() {
        const tbody = document.getElementById('browser-device-table');
        const { browserDevice } = this.data;
        
        // Combine browser and device data in alternating rows
        let html = '';
        const maxRows = Math.max(browserDevice.browsers?.length || 0, browserDevice.devices?.length || 0);
        
        for (let i = 0; i < maxRows; i++) {
            const browser = browserDevice.browsers?.[i];
            const device = browserDevice.devices?.[i];
            
            html += `
                <tr>
                    <td>${browser?.name || '-'}</td>
                    <td>${browser ? this.formatNumber(browser.users) : '-'}</td>
                    <td>${device?.type || '-'}</td>
                    <td>${device ? this.formatNumber(device.users) : '-'}</td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
    }

    updateGeographicTable() {
        const tbody = document.getElementById('geographic-table');
        const { geographic } = this.data;
        
        tbody.innerHTML = geographic.map(country => `
            <tr>
                <td>${country.name}</td>
                <td>${this.formatNumber(country.visitors)}</td>
                <td>${this.formatNumber(country.sessions)}</td>
                <td>${this.formatDuration(country.avgDuration)}</td>
            </tr>
        `).join('');
    }

    updateEventsTable() {
        const tbody = document.getElementById('events-table');
        const { events } = this.data;
        
        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${event.name}</td>
                <td>${this.formatNumber(event.count)}</td>
                <td>${this.formatNumber(event.uniqueUsers)}</td>
                <td>${this.formatDate(event.lastOccurred)}</td>
            </tr>
        `).join('');
    }

    updateRealtime() {
        const { realtime } = this.data;
        
        document.getElementById('active-users').textContent = realtime.activeUsers || 0;
        document.getElementById('recent-pageviews').textContent = realtime.recentPageviews || 0;
        
        const activityContainer = document.getElementById('realtime-activity');
        activityContainer.innerHTML = (realtime.recentActivity || []).map(activity => `
            <div class="activity-item">
                ${activity.timestamp} - ${activity.event} on ${activity.page}
            </div>
        `).join('');
    }

    // Filtering
    filterEvents(eventType) {
        // This would filter the events table based on event type
        console.log('Filtering events by:', eventType);
    }

    // Auto Refresh
    startAutoRefresh() {
        if (this.refreshTimer) return;
        
        this.refreshTimer = setInterval(() => {
            if (this.config.realtime) {
                this.fetchRealtime().then(realtime => {
                    this.data.realtime = realtime;
                    this.updateRealtime();
                });
            }
        }, this.config.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // Export functionality
    exportData() {
        const dataToExport = {
            exportDate: new Date().toISOString(),
            dateRange: this.config.dateRange,
            data: this.data
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // UI Helper Methods
    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showError(message) {
        // You could implement a more sophisticated error display
        alert(message);
    }

    // Formatting Utilities
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDuration(seconds) {
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }
    }

    formatPercentage(value) {
        return (value * 100).toFixed(1) + '%';
    }

    formatChange(value) {
        const sign = value >= 0 ? '+' : '';
        return sign + (value * 100).toFixed(1) + '%';
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString() + ' ' + 
               new Date(timestamp).toLocaleTimeString();
    }

    getPeriodText() {
        const periods = {
            '1d': 'Last 24 hours',
            '7d': 'Last 7 days',
            '30d': 'Last 30 days',
            '90d': 'Last 90 days'
        };
        return periods[this.config.dateRange] || 'Custom period';
    }

    getChangeClass(value, inverse = false) {
        if (value === 0) return '';
        const positive = inverse ? value < 0 : value > 0;
        return positive ? 'positive' : 'negative';
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        const container = document.getElementById('analytics-dashboard');
        if (container) {
            container.remove();
        }
        
        const styles = document.getElementById('dashboard-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Global initialization
let analyticsDashboard;

function initAnalyticsDashboard(config = {}) {
    if (!analyticsDashboard) {
        analyticsDashboard = new AnalyticsDashboard(config);
    }
    return analyticsDashboard;
}

// Global API
window.AnalyticsDashboard = AnalyticsDashboard;
window.initAnalyticsDashboard = initAnalyticsDashboard;

// Auto-initialize if config is provided
if (window.dashboardConfig) {
    initAnalyticsDashboard(window.dashboardConfig);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
}

export default AnalyticsDashboard;

// Additional utility functions for dashboard integration

// Sample data generator for testing
window.generateSampleData = function() {
    return {
        overview: {
            pageviews: 15420,
            pageviewsChange: 0.12,
            uniqueVisitors: 8930,
            visitorsChange: 0.08,
            avgDuration: 142,
            durationChange: 0.05,
            bounceRate: 0.34,
            bounceChange: -0.02
        },
        pages: [
            { path: '/', views: 5430, uniqueViews: 3210, avgTime: 120 },
            { path: '/about', views: 2340, uniqueViews: 1890, avgTime: 95 },
            { path: '/products', views: 1980, uniqueViews: 1650, avgTime: 180 },
            { path: '/contact', views: 1420, uniqueViews: 1200, avgTime: 75 },
            { path: '/blog', views: 980, uniqueViews: 850, avgTime: 210 }
        ],
        sources: [
            { name: 'Direct', visitors: 3420, sessions: 4120, conversionRate: 0.045 },
            { name: 'Google Search', visitors: 2890, sessions: 3450, conversionRate: 0.038 },
            { name: 'Social Media', visitors: 1560, sessions: 1890, conversionRate: 0.028 },
            { name: 'Email', visitors: 890, sessions: 1020, conversionRate: 0.067 },
            { name: 'Referral', visitors: 670, sessions: 780, conversionRate: 0.035 }
        ],
        browserDevice: {
            browsers: [
                { name: 'Chrome', users: 5420 },
                { name: 'Safari', users: 2340 },
                { name: 'Firefox', users: 1230 },
                { name: 'Edge', users: 890 },
                { name: 'Other', users: 450 }
            ],
            devices: [
                { type: 'Desktop', users: 5890 },
                { type: 'Mobile', users: 3420 },
                { type: 'Tablet', users: 1020 }
            ]
        },
        geographic: [
            { name: 'United States', visitors: 3420, sessions: 4120, avgDuration: 145 },
            { name: 'United Kingdom', visitors: 1890, sessions: 2340, avgDuration: 132 },
            { name: 'Canada', visitors: 1230, sessions: 1450, avgDuration: 156 },
            { name: 'Germany', visitors: 890, sessions: 1020, avgDuration: 128 },
            { name: 'France', users: 670, sessions: 780, avgDuration: 141 }
        ],
        events: [
            { name: 'page_view', count: 15420, uniqueUsers: 8930, lastOccurred: Date.now() - 300000 },
            { name: 'click', count: 4530, uniqueUsers: 3210, lastOccurred: Date.now() - 180000 },
            { name: 'form_submit', count: 234, uniqueUsers: 189, lastOccurred: Date.now() - 120000 },
            { name: 'scroll_milestone', count: 2340, uniqueUsers: 1890, lastOccurred: Date.now() - 240000 },
            { name: 'conversion', count: 89, uniqueUsers: 78, lastOccurred: Date.now() - 420000 }
        ],
        realtime: {
            activeUsers: 23,
            recentPageviews: 145,
            recentActivity: [
                { timestamp: '2:34 PM', event: 'Page View', page: '/products' },
                { timestamp: '2:33 PM', event: 'Click', page: '/about' },
                { timestamp: '2:33 PM', event: 'Page View', page: '/' },
                { timestamp: '2:32 PM', event: 'Form Submit', page: '/contact' },
                { timestamp: '2:32 PM', event: 'Page View', page: '/blog' }
            ]
        }
    };
};

// Mock API server for testing
window.createMockAnalyticsAPI = function() {
    // This would typically be on your server
    const sampleData = window.generateSampleData();
    
    // Mock fetch responses
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.includes('/api/analytics/')) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let data;
                    if (url.includes('/overview')) data = sampleData.overview;
                    else if (url.includes('/pages')) data = sampleData.pages;
                    else if (url.includes('/sources')) data = sampleData.sources;
                    else if (url.includes('/browser-device')) data = sampleData.browserDevice;
                    else if (url.includes('/geographic')) data = sampleData.geographic;
                    else if (url.includes('/events')) data = sampleData.events;
                    else if (url.includes('/realtime')) data = sampleData.realtime;
                    else data = {};
                    
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(data)
                    });
                }, 500); // Simulate network delay
            });
        }
        return originalFetch.apply(this, arguments);
    };
    
    console.log('Mock Analytics API created. You can now test the dashboard with sample data.');
};

// Usage examples and documentation
window.dashboardExamples = {
    // Basic initialization
    basic: `
        // Initialize with default settings
        const dashboard = new AnalyticsDashboard({
            apiEndpoint: '/api/analytics',
            refreshInterval: 30000,
            dateRange: '7d'
        });
    `,
    
    // Custom configuration
    advanced: `
        // Initialize with custom settings
        const dashboard = new AnalyticsDashboard({
            apiEndpoint: 'https://your-api.com/analytics',
            refreshInterval: 15000,
            dateRange: '30d',
            timezone: 'America/New_York',
            charts: true,
            realtime: true
        });
    `,
    
    // Integration with tracking
    integration: `
        // Initialize dashboard after setting up tracking
        const tracker = new WebTracker({
            endpoint: '/api/track'
        });
        
        const dashboard = new AnalyticsDashboard({
            apiEndpoint: '/api/analytics'
        });
        
        // Or use with pixel tracking
        const pixelTracker = new PixelTracker({
            endpoint: '/pixel.gif'
        });
    `,
    
    // Testing with mock data
    testing: `
        // Create mock API for testing
        window.createMockAnalyticsAPI();
        
        // Initialize dashboard with mock data
        const dashboard = new AnalyticsDashboard({
            apiEndpoint: '/api/analytics'
        });
    `
};

console.log('Analytics Dashboard loaded. Examples available in window.dashboardExamples');
console.log('Use window.createMockAnalyticsAPI() to test with sample data');
