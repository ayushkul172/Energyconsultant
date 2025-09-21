<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DB TRACKER</title>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts - Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Chart.js for data visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    <style>
        /* CSS from DB TRACKER.css, with corrections and improvements */
        :root {
            --primary: #667eea;
            --secondary: #764ba2;
            --accent: #00d4aa;
            --warning: #ff6b6b;
            --success: #51cf66;
            --dark: #1a1d29;
            --darker: #0f1117;
            --glass: rgba(255, 255, 255, 0.1);
            --glass-light: rgba(255, 255, 255, 0.2);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--darker);
            color: #d1d1d1;
            margin: 0;
            padding: 2rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }

        .dashboard-container {
            width: 100%;
            max-width: 1200px;
            display: grid;
            gap: 2rem;
            grid-template-columns: 1fr;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
            background: linear-gradient(45deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
            background-color: #5a64d1;
            transform: translateY(-2px);
        }

        .btn-secondary {
            background-color: var(--glass);
            color: white;
            border: 1px solid var(--glass-light);
        }

        .btn-secondary:hover {
            background-color: var(--glass-light);
        }

        .card {
            background-color: var(--glass);
            backdrop-filter: blur(10px);
            border-radius: 1.5rem;
            padding: 1.5rem;
            border: 1px solid var(--glass-light);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .metric-card {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
            padding: 1.25rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .metric-value {
            font-size: 2.25rem;
            font-weight: 700;
            background: linear-gradient(45deg, #a8c0ff, #3f2b96);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .metric-label {
            font-size: 0.875rem;
            color: #bbb;
            margin-top: 0.5rem;
        }

        .chart-container {
            background-color: var(--glass);
            backdrop-filter: blur(10px);
            border-radius: 1.5rem;
            padding: 1.5rem;
            border: 1px solid var(--glass-light);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }

        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .interactive-chart {
            position: relative;
        }

        .interactive-chart img {
            max-width: 100%;
            height: auto;
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            z-index: 10;
        }

        .tooltip {
            position: relative;
        }

        .tooltip::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 20;
        }

        .tooltip:hover::after {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(-20px);
        }

        /* Responsive adjustments */
        @media (min-width: 768px) {
            .dashboard-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

<div class="dashboard-container">
    <div class="header">
        <div class="title">
            <i class="fas fa-database"></i>
            DB Tracker
        </div>
        <a href="#" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            New Entry
        </a>
    </div>

    <div class="card">
        <div class="metrics-grid">
            <div class="metric-card tooltip" data-tooltip="Total number of projects currently tracked">
                <div class="metric-value" id="projectCount"></div>
                <div class="metric-label">Total Projects</div>
            </div>
            <div class="metric-card tooltip" data-tooltip="Projects completed this month">
                <div class="metric-value" id="completedProjects"></div>
                <div class="metric-label">Completed Projects</div>
            </div>
            <div class="metric-card tooltip" data-tooltip="Percentage of returning visitors">
                <div class="metric-value" id="returningVisitors"></div>
                <div class="metric-label">Returning Visitors</div>
            </div>
            <div class="metric-card tooltip" data-tooltip="Overall user engagement rate">
                <div class="metric-value" id="engagementRate"></div>
                <div class="metric-label">Engagement Rate</div>
            </div>
        </div>
    </div>

    <div class="chart-container">
        <div class="chart-header">
            <div class="chart-title">
                <i class="fas fa-chart-area"></i>
                Entry Trends
            </div>
            <div class="chart-actions">
                <button class="btn btn-secondary" onclick="toggleChartType()">
                    <i class="fas fa-chart-bar"></i>
                    Toggle View
                </button>
            </div>
        </div>
        <div class="interactive-chart">
            <canvas id="trackerChart"></canvas>
            <div class="chart-overlay" id="chartOverlay"></div>
        </div>
    </div>

    <!-- New card for a static image, for example, a screenshot of a dashboard -->
    <div class="card">
        <div class="chart-header">
            <div class="chart-title">
                <i class="fas fa-image"></i>
                Sample Dashboard View
            </div>
        </div>
        <div class="interactive-chart">
            <img src="https://placehold.co/1200x600/1a1d29/764ba2?text=Sample+Dashboard+Screenshot" alt="Sample Dashboard Screenshot" loading="lazy">
        </div>
    </div>
</div>

<script>
    // JavaScript for dynamic data and chart functionality
    document.addEventListener('DOMContentLoaded', () => {

        // --- Dynamic Data Generation (for demonstration) ---
        document.getElementById('projectCount').textContent = Math.floor(Math.random() * 50 + 50);
        document.getElementById('completedProjects').textContent = Math.floor(Math.random() * 20 + 5);
        document.getElementById('returningVisitors').textContent = `${Math.floor(Math.random() * 70 + 20)}%`;
        document.getElementById('engagementRate').textContent = `${Math.floor(Math.random() * 80 + 60)}%`;

        // --- Chart.js Setup ---
        const ctx = document.getElementById('trackerChart').getContext('2d');
        let chartInstance;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'New Entries',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: 'rgba(102, 126, 234, 0.4)',
                borderColor: '#667eea',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Updates',
                data: [28, 48, 40, 19, 86, 27, 90],
                backgroundColor: 'rgba(118, 75, 162, 0.4)',
                borderColor: '#764ba2',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ccc'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ccc'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ccc'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                }
            }
        };

        // Initialize the chart
        function createChart(type) {
            if (chartInstance) {
                chartInstance.destroy();
            }
            config.type = type;
            chartInstance = new Chart(ctx, config);
        }

        createChart('line');

        // --- Toggle Chart Type Function ---
        window.toggleChartType = () => {
            const currentType = chartInstance.config.type;
            const newType = currentType === 'line' ? 'bar' : 'line';
            createChart(newType);
        };
    });
</script>

</body>
</html>
