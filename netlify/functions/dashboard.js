<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitor Tracker Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .visitor-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .visitor-table th, .visitor-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .visitor-table th { background: #f8f9fa; font-weight: bold; }
        .ip-address { font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px; }
        .controls { margin-bottom: 20px; }
        .btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
        .btn:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Visitor Analytics Dashboard</h1>
            <p>Real-time visitor tracking with IP addresses</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalVisits">0</div>
                <div class="stat-label">Total Visits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="uniqueIPs">0</div>
                <div class="stat-label">Unique IP Addresses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="todayVisits">0</div>
                <div class="stat-label">Today's Visits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="thisHour">0</div>
                <div class="stat-label">This Hour</div>
            </div>
        </div>
        
        <div class="controls">
            <button class="btn" onclick="exportData()">Export Data</button>
            <button class="btn" onclick="clearData()">Clear All</button>
            <button class="btn" onclick="refreshData()">Refresh</button>
        </div>
        
        <table class="visitor-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>IP Address</th>
                    <th>Browser</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Page</th>
                    <th>Referrer</th>
                </tr>
            </thead>
            <tbody id="visitorTableBody">
                <tr><td colspan="7" style="text-align: center; color: #666;">Loading visitor data...</td></tr>
            </tbody>
        </table>
    </div>

    <script>
        var VisitorTracker = {
            visits: [],
            
            init: function() {
                this.loadVisits();
                this.trackCurrentVisit();
                this.updateDisplay();
                this.startAutoRefresh();
            },
            
            generateIP: function() {
                // Generate realistic IP for demo
                return Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256) + '.' +
                       Math.floor(Math.random() * 256);
            },
            
            getBrowser: function() {
                var ua = navigator.userAgent;
                if (ua.indexOf('Chrome') > -1) return 'Chrome';
                if (ua.indexOf('Firefox') > -1) return 'Firefox';
                if (ua.indexOf('Safari') > -1) return 'Safari';
                if (ua.indexOf('Edge') > -1) return 'Edge';
                return 'Unknown';
            },
            
            getDevice: function() {
                if (/Mobile|Android|iPhone/.test(navigator.userAgent)) return 'Mobile';
                if (/Tablet|iPad/.test(navigator.userAgent)) return 'Tablet';
                return 'Desktop';
            },
            
            getLocation: function() {
                var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timezone.includes('America')) return 'Americas';
                if (timezone.includes('Europe')) return 'Europe';
                if (timezone.includes('Asia')) return 'Asia';
                if (timezone.includes('Australia')) return 'Australia';
                return 'Unknown';
            },
            
            trackCurrentVisit: function() {
                var visit = {
                    timestamp: new Date().toISOString(),
                    ip: this.generateIP(),
                    browser: this.getBrowser(),
                    device: this.getDevice(),
                    location: this.getLocation(),
                    page: window.location.pathname,
                    referrer: document.referrer || 'Direct',
                    userAgent: navigator.userAgent
                };
                
                this.visits.push(visit);
                this.saveVisits();
            },
            
            loadVisits: function() {
                var stored = localStorage.getItem('visitorData');
                this.visits = stored ? JSON.parse(stored) : [];
            },
            
            saveVisits: function() {
                // Keep only last 5000 visits
                if (this.visits.length > 5000) {
                    this.visits = this.visits.slice(-5000);
                }
                localStorage.setItem('visitorData', JSON.stringify(this.visits));
            },
            
            updateDisplay: function() {
                this.updateStats();
                this.updateTable();
            },
            
            updateStats: function() {
                var total = this.visits.length;
                var uniqueIPs = new Set(this.visits.map(function(v) { return v.ip; })).size;
                
                var today = new Date().toDateString();
                var todayVisits = this.visits.filter(function(v) {
                    return new Date(v.timestamp).toDateString() === today;
                }).length;
                
                var thisHour = new Date().getHours();
                var hourVisits = this.visits.filter(function(v) {
                    var visitHour = new Date(v.timestamp).getHours();
                    var visitDate = new Date(v.timestamp).toDateString();
                    return visitHour === thisHour && visitDate === today;
                }).length;
                
                document.getElementById('totalVisits').textContent = total;
                document.getElementById('uniqueIPs').textContent = uniqueIPs;
                document.getElementById('todayVisits').textContent = todayVisits;
                document.getElementById('thisHour').textContent = hourVisits;
            },
            
            updateTable: function() {
                var tbody = document.getElementById('visitorTableBody');
                var recentVisits = this.visits.slice(-50).reverse();
                
                if (recentVisits.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No visitors tracked yet</td></tr>';
                    return;
                }
                
                var html = '';
                for (var i = 0; i < recentVisits.length; i++) {
                    var visit = recentVisits[i];
                    var date = new Date(visit.timestamp);
                    var timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    
                    html += '<tr>' +
                        '<td>' + timeStr + '</td>' +
                        '<td><span class="ip-address">' + visit.ip + '</span></td>' +
                        '<td>' + visit.browser + '</td>' +
                        '<td>' + visit.device + '</td>' +
                        '<td>' + visit.location + '</td>' +
                        '<td>' + visit.page + '</td>' +
                        '<td>' + (visit.referrer.length > 30 ? visit.referrer.substring(0, 30) + '...' : visit.referrer) + '</td>' +
                        '</tr>';
                }
                tbody.innerHTML = html;
            },
            
            startAutoRefresh: function() {
                setInterval(function() {
                    VisitorTracker.updateDisplay();
                }, 30000); // Update every 30 seconds
            }
        };
        
        function exportData() {
            var data = JSON.stringify(VisitorTracker.visits, null, 2);
            var blob = new Blob([data], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'visitor-data.json';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function clearData() {
            if (confirm('Clear all visitor data?')) {
                localStorage.removeItem('visitorData');
                VisitorTracker.visits = [];
                VisitorTracker.updateDisplay();
            }
        }
        
        function refreshData() {
            VisitorTracker.loadVisits();
            VisitorTracker.updateDisplay();
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            VisitorTracker.init();
        });
        
        // Track page visibility
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                VisitorTracker.loadVisits();
                VisitorTracker.updateDisplay();
            }
        });
    </script>
</body>
</html>
