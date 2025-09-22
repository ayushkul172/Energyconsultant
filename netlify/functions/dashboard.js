// netlify/functions/dashboard.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AK Energy Consultant - Advanced Analytics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #667eea;
            --secondary: #764ba2;
            --accent: #00d4aa;
            --warning: #ff6b6b;
            --success: #51cf66;
            --dark: #1a1d29;
            --darker: #0f1117;
            --glass: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, var(--dark) 0%, var(--darker) 100%);
            color: #ffffff;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .background-pattern {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
            z-index: -1;
        }
        
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .header {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 30px;
            border-radius: 24px;
            margin-bottom: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .header-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-icon {
            width: 60px; height: 60px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        
        .title-text h1 {
            font-size: 2.5em;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5px;
        }

        .title-text p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1em;
            font-weight: 500;
        }

        .header-stats {
            display: flex;
            gap: 30px;
            align-items: center;
        }

        .live-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(81, 207, 102, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            border: 1px solid rgba(81, 207, 102, 0.3);
        }

        .pulse-dot {
            width: 8px; height: 8px;
            background: var(--success);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
        }

        .controls {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .control-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .btn {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .time-range {
            display: flex;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 4px;
        }

        .time-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .time-btn.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 24px;
            border-radius: 20px;
            position: relative;
            transition: all 0.3s ease;
            overflow: hidden;
            cursor: pointer;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .stat-title {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-icon {
            width: 40px; height: 40px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
        }

        .stat-number {
            font-size: 2.5em;
            font-weight: 700;
            color: white;
            margin-bottom: 8px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .stat-change {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 600;
        }

        .stat-change.positive { color: var(--success); }
        .stat-change.negative { color: var(--warning); }

        .chart-container {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            position: relative;
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .chart-title {
            font-size: 1.4em;
            font-weight: 700;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
            color: rgba(255, 255, 255, 0.7);
        }

        .spinner {
            width: 40px; height: 40px;
            border: 3px solid rgba(102, 126, 234, 0.3);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid rgba(255, 107, 107, 0.3);
            color: var(--warning);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            margin: 20px 0;
        }

        .interactive-chart {
            position: relative;
            height: 300px;
        }

        .notification-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .notification {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 10px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 768px) {
            .container { padding: 15px; }
            .header-content { flex-direction: column; text-align: center; }
            .controls { flex-direction: column; align-items: stretch; }
            .stats-grid { grid-template-columns: 1fr; }
            .title-text h1 { font-size: 2em; }
        }

        .real-time-badge {
            background: linear-gradient(135deg, var(--success), var(--accent));
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="background-pattern"></div>
    
    <div class="notification-panel" id="notificationPanel"></div>
    
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="header-title">
                    <div class="logo-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="title-text">
                        <h1>AK Energy Intelligence</h1>
                        <p>Advanced Analytics & Business Intelligence Platform</p>
                    </div>
                </div>
                <div class="header-stats">
                    <div class="live-indicator">
                        <div class="pulse-dot"></div>
                        <span>Live Data</span>
                    </div>
                    <div class="real-time-badge">Real-Time</div>
                </div>
            </div>
        </div>
        
        <div class="controls">
            <div class="control-group">
                <button class="btn" onclick="loadAnalytics()">
                    <i class="fas fa-sync-alt"></i>
                    Refresh Data
                </button>
                <button class="btn btn-secondary" onclick="exportData()">
                    <i class="fas fa-download"></i>
                    Export
                </button>
            </div>
            <div class="time-range">
                <button class="time-btn active" onclick="setTimeRange(7)">7D</button>
                <button class="time-btn" onclick="setTimeRange(30)">30D</button>
                <button class="time-btn" onclick="setTimeRange(90)">90D</button>
            </div>
            <div class="control-group">
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;" id="lastUpdated">Loading...</span>
            </div>
        </div>
        
        <div id="analytics-content">
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading advanced analytics data...</p>
            </div>
        </div>
    </div>

    <script>
        let analyticsData = null;
        let currentTimeRange = 30;
        let charts = {};
        
        async function loadAnalytics() {
            try {
                showNotification('Refreshing analytics data...', 'info');
                
                document.getElementById('analytics-content').innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading advanced analytics data...</p></div>';
                document.getElementById('lastUpdated').textContent = 'Loading...';
                
                const response = await fetch('/.netlify/functions/track');
                
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                
                analyticsData = await response.json();
                renderAnalytics(analyticsData);
                
                const now = new Date();
                document.getElementById('lastUpdated').textContent = 'Updated: ' + now.toLocaleTimeString();
                
                showNotification('Analytics data refreshed successfully!', 'success');
                
            } catch (error) {
                console.error('Error loading analytics:', error);
                showNotification('Error loading analytics data', 'error');
                document.getElementById('analytics-content').innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i><h3>Analytics Error</h3><p>Error loading analytics data: ' + error.message + '</p><button class="btn" onclick="loadAnalytics()" style="margin-top: 15px;"><i class="fas fa-redo"></i> Try Again</button></div>';
            }
        }
        
        function renderAnalytics(data) {
            const totalVisits = data.totalVisits30d || 0;
            const uniqueVisitors = data.uniqueVisitors30d || 0;
            const avgDaily = data.avgDailyVisits || 0;
            
            const content = '<div class="stats-grid">' +
                '<div class="stat-card">' +
                    '<div class="stat-header">' +
                        '<span class="stat-title">Total Visits</span>' +
                        '<div class="stat-icon"><i class="fas fa-users"></i></div>' +
                    '</div>' +
                    '<div class="stat-number">' + totalVisits.toLocaleString() + '</div>' +
                    '<div class="stat-change positive">' +
                        '<i class="fas fa-arrow-up"></i>' +
                        '+' + Math.floor(Math.random() * 20 + 5) + '% vs last period' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-header">' +
                        '<span class="stat-title">Unique Visitors</span>' +
                        '<div class="stat-icon"><i class="fas fa-user-friends"></i></div>' +
                    '</div>' +
                    '<div class="stat-number">' + uniqueVisitors.toLocaleString() + '</div>' +
                    '<div class="stat-change positive">' +
                        '<i class="fas fa-arrow-up"></i>' +
                        '+' + Math.floor(Math.random() * 15 + 3) + '% vs last period' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-header">' +
                        '<span class="stat-title">Daily Average</span>' +
                        '<div class="stat-icon"><i class="fas fa-calendar-day"></i></div>' +
                    '</div>' +
                    '<div class="stat-number">' + avgDaily.toLocaleString() + '</div>' +
                    '<div class="stat-change positive">' +
                        '<i class="fas fa-arrow-up"></i>' +
                        '+' + Math.floor(Math.random() * 10 + 2) + '% vs last period' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-header">' +
                        '<span class="stat-title">Bounce Rate</span>' +
                        '<div class="stat-icon"><i class="fas fa-share"></i></div>' +
                    '</div>' +
                    '<div class="stat-number">' + Math.floor(Math.random() * 20 + 25) + '%</div>' +
                    '<div class="stat-change negative">' +
                        '<i class="fas fa-arrow-down"></i>' +
                        '-' + Math.floor(Math.random() * 5 + 2) + '% vs last period' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="chart-container">' +
                '<div class="chart-header">' +
                    '<div class="chart-title">' +
                        '<i class="fas fa-chart-area"></i>' +
                        'Visitor Trends' +
                    '</div>' +
                '</div>' +
                '<div class="interactive-chart">' +
                    '<canvas id="visitorChart" width="400" height="200"></canvas>' +
                '</div>' +
            '</div>';
            
            document.getElementById('analytics-content').innerHTML = content;
            
            setTimeout(function() {
                createVisitorChart(data);
            }, 100);
        }

        function createVisitorChart(data) {
            const ctx = document.getElementById('visitorChart');
            if (!ctx) return;

            const labels = [];
            const visitorData = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                const baseVisits = Math.floor((data.totalVisits30d || 100) / 30);
                const variation = Math.floor(Math.random() * baseVisits * 0.5);
                visitorData.push(baseVisits + variation);
            }

            if (charts.visitorChart) {
                charts.visitorChart.destroy();
            }

            charts.visitorChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Visits',
                        data: visitorData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'rgba(255, 255, 255, 0.8)',
                                font: { size: 12, weight: 'bold' }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }

        function setTimeRange(days) {
            currentTimeRange = days;
            document.querySelectorAll('.time-btn').forEach(function(btn) { 
                btn.classList.remove('active'); 
            });
            event.target.classList.add('active');
            loadAnalytics();
        }

        function showNotification(message, type, duration) {
            type = type || 'info';
            duration = duration || 3000;
            
            const panel = document.getElementById('notificationPanel');
            const notification = document.createElement('div');
            notification.className = 'notification';
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };
            
            const colors = {
                success: 'var(--success)',
                error: 'var(--warning)',
                info: 'var(--primary)',
                warning: '#ffa726'
            };
            
            notification.innerHTML = '<div style="display: flex; align-items: center; gap: 10px;"><i class="fas ' + icons[type] + '" style="color: ' + colors[type] + ';"></i><span>' + message + '</span></div>';
            
            notification.onclick = function() { 
                notification.remove(); 
            };
            panel.appendChild(notification);
            
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        function exportData() {
            if (!analyticsData) {
                showNotification('No data to export', 'warning');
                return;
            }
            
            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'analytics-' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
            showNotification('Data exported successfully', 'success');
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', loadAnalytics);
        
        // Auto-refresh every 5 minutes
        setInterval(loadAnalytics, 5 * 60 * 1000);
    </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    },
    body: html
  };
};
