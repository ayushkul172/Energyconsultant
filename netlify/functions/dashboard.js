// netlify/functions/dashboard.js
// Analytics dashboard function for AK Energy Consultant

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AK Energy Consultant - Analytics Dashboard</title>
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
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header p {
            color: #666;
            font-size: 1.2em;
        }
        
        .controls {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .refresh-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .last-updated {
            color: #666;
            font-style: italic;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #666;
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .chart-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .table th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            background: rgba(255, 255, 255, 0.7);
        }
        
        .table tr:hover td {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #eee;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 5px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
        
        .error {
            background: rgba(255, 0, 0, 0.1);
            color: #d00;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        
        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                text-align: center;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AK Energy Consultant</h1>
            <p>Independent Visitor Analytics Dashboard</p>
        </div>
        
        <div class="controls">
            <button class="refresh-btn" onclick="loadAnalytics()">🔄 Refresh Data</button>
            <div class="last-updated" id="lastUpdated">Loading...</div>
        </div>
        
        <div id="analytics-content">
            <div class="loading">📊 Loading analytics data...</div>
        </div>
    </div>

    <script>
        let analyticsData = null;
        
        async function loadAnalytics() {
            try {
                document.getElementById('analytics-content').innerHTML = '<div class="loading">📊 Loading analytics data...</div>';
                document.getElementById('lastUpdated').textContent = 'Loading...';
                
                const response = await fetch('/.netlify/functions/track');
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                analyticsData = await response.json();
                renderAnalytics(analyticsData);
                
                const now = new Date();
                document.getElementById('lastUpdated').textContent = \`Last updated: \${now.toLocaleString()}\`;
                
            } catch (error) {
                console.error('Error loading analytics:', error);
                document.getElementById('analytics-content').innerHTML = \`
                    <div class="error">
                        ❌ Error loading analytics data: \${error.message}
                        <br><br>
                        <button class="refresh-btn" onclick="loadAnalytics()">Try Again</button>
                    </div>
                \`;
            }
        }
        
        function renderAnalytics(data) {
            const content = \`
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">\${data.totalVisits30d || 0}</div>
                        <div class="stat-label">Total Visits (30 Days)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${data.uniqueVisitors30d || 0}</div>
                        <div class="stat-label">Unique Visitors (30 Days)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${data.totalVisits7d || 0}</div>
                        <div class="stat-label">Visits (7 Days)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">\${data.avgDailyVisits || 0}</div>
                        <div class="stat-label">Avg Daily Visits</div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">📈 Top Pages</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Page URL</th>
                                <th>Visits</th>
                                <th>Unique Visitors</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${(data.topPages || []).map(page => \`
                                <tr>
                                    <td>\${page.page}</td>
                                    <td>\${page.visits}</td>
                                    <td>\${page.uniqueVisitors}</td>
                                    <td>
                                        \${Math.round((page.visits / (data.totalVisits30d || 1)) * 100)}%
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: \${Math.round((page.visits / (data.totalVisits30d || 1)) * 100)}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">📱 Device Types</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${(data.deviceBreakdown || []).map(device => \`
                                <tr>
                                    <td>\${device.device}</td>
                                    <td>\${device.count}</td>
                                    <td>
                                        \${device.percentage}%
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: \${device.percentage}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">🌍 Top Countries</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Country</th>
                                <th>Visitors</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${(data.countryBreakdown || []).slice(0, 10).map(country => \`
                                <tr>
                                    <td>\${country.country}</td>
                                    <td>\${country.count}</td>
                                    <td>
                                        \${country.percentage}%
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: \${country.percentage}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="chart-container">
                    <h3 class="chart-title">🔗 Top Referrers</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Referrer</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${(data.topReferrers || []).length > 0 ? 
                                data.topReferrers.map(ref => \`
                                    <tr>
                                        <td>\${ref.referrer}</td>
                                        <td>\${ref.count}</td>
                                    </tr>
                                \`).join('') : 
                                '<tr><td colspan="2">No referrer data available</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            \`;
            
            document.getElementById('analytics-content').innerHTML = content;
        }
        
        // Load analytics on page load
        document.addEventListener('DOMContentLoaded', loadAnalytics);
        
        // Auto-refresh every 5 minutes
        setInterval(loadAnalytics, 5 * 60 * 1000);
    </script>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    },
    body: dashboardHTML
  };
};
