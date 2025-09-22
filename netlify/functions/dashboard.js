import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, Users, Eye, Clock, MapPin, Smartphone, TrendingUp, AlertTriangle, BarChart3, Download, Maximize2, RefreshCw } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 247,
    pageViews: 1843,
    bounceRate: 32.4,
    avgSessionDuration: '4m 23s',
    totalVisits: 1,
    uniqueVisitors: 1,
    dailyAverage: 0,
    conversionRate: 6.38,
    loadTime: 2.45
  });

  // Sample data with dark theme colors
  const trafficSourceData = [
    { name: 'Organic Search', value: 45, color: '#3B82F6' },
    { name: 'Direct', value: 25, color: '#10B981' },
    { name: 'Social Media', value: 15, color: '#8B5CF6' },
    { name: 'Referral', value: 10, color: '#F59E0B' },
    { name: 'Email', value: 5, color: '#EF4444' }
  ];

  const pageViewsData = [
    { time: '00:00', views: 45, unique: 32 },
    { time: '04:00', views: 23, unique: 18 },
    { time: '08:00', views: 167, unique: 134 },
    { time: '12:00', views: 234, unique: 187 },
    { time: '16:00', views: 298, unique: 234 },
    { time: '20:00', views: 189, unique: 156 },
    { time: '24:00', views: 78, unique: 65 }
  ];

  const deviceData = [
    { device: 'Mobile', visitors: 234, percentage: 58 },
    { device: 'Desktop', visitors: 142, percentage: 35 },
    { device: 'Tablet', visitors: 28, percentage: 7 }
  ];

  const topPages = [
    { page: '/home', views: 1234, time: '5m 12s', bounce: '25%' },
    { page: '/products', views: 987, time: '7m 45s', bounce: '18%' },
    { page: '/about', views: 654, time: '3m 22s', bounce: '45%' },
    { page: '/contact', views: 432, time: '2m 15s', bounce: '67%' },
    { page: '/blog', views: 321, time: '8m 33s', bounce: '12%' }
  ];

  const geoData = [
    { country: 'United States', visitors: 145, flag: '🇺🇸' },
    { country: 'India', visitors: 89, flag: '🇮🇳' },
    { country: 'United Kingdom', visitors: 67, flag: '🇬🇧' },
    { country: 'Germany', visitors: 45, flag: '🇩🇪' },
    { country: 'Canada', visitors: 34, flag: '🇨🇦' }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        pageViews: prev.pageViews + Math.floor(Math.random() * 20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ icon: Icon, title, value, change, changeText, isPositive = true, size = "normal" }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        </div>
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      <div className="mb-3">
        <p className={`font-bold text-white ${size === "large" ? "text-4xl" : "text-2xl"}`}>{value}</p>
      </div>
      {change && (
        <div className="flex items-center">
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span className="mr-1">{isPositive ? '↗' : '↘'}</span>
            <span>{change}</span>
          </div>
          {changeText && <span className="text-gray-500 text-sm ml-2">{changeText}</span>}
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ text, type = "success" }) => {
    const colors = {
      success: "bg-green-500/10 text-green-400 border-green-500/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[type]}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AK Energy Intelligence</h1>
                <p className="text-gray-400">Advanced Analytics & Business Intelligence Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge text="Live Data Stream" type="success" />
              <StatusBadge text="REAL-TIME" type="info" />
              <StatusBadge text="SYSTEM ONLINE" type="success" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Analytics</span>
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Maximize2 className="w-4 h-4" />
                <span>Fullscreen Mode</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                {['7 Days', '30 Days', '90 Days', '1 Year'].map((period, index) => (
                  <button
                    key={period}
                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                      index === 0 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Last sync:</div>
                <div className="text-sm text-white font-medium">23:31:54</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Real-Time Monitoring</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Live visitor tracking with instant updates and real-time alerts for traffic spikes and anomalies.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI-Powered Insights</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Machine learning algorithms provide predictive analytics and automated recommendations.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Security Analytics</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced threat detection and security monitoring with automated incident response capabilities.
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Mobile Optimization</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Comprehensive mobile analytics with responsive design insights and performance metrics.
            </p>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="TOTAL VISITS"
            value={realTimeData.totalVisits.toLocaleString()}
            change="+12% growth rate"
            isPositive={true}
            size="large"
          />
          <MetricCard
            icon={Eye}
            title="UNIQUE VISITORS"
            value={realTimeData.uniqueVisitors.toLocaleString()}
            change="+85% vs previous period"
            isPositive={true}
            size="large"
          />
          <MetricCard
            icon={TrendingUp}
            title="DAILY AVERAGE"
            value={realTimeData.dailyAverage.toLocaleString()}
            change="Steady increase trend"
            changeText=""
            isPositive={true}
            size="large"
          />
          <MetricCard
            icon={Activity}
            title="BOUNCE RATE"
            value={`${realTimeData.bounceRate}%`}
            change="-8% improvement"
            isPositive={true}
            size="large"
          />
          <MetricCard
            icon={TrendingUp}
            title="CONVERSION RATE"
            value={`${realTimeData.conversionRate}%`}
            change="Above industry average"
            isPositive={true}
            size="large"
          />
          <MetricCard
            icon={Clock}
            title="LOAD TIME"
            value={`${realTimeData.loadTime}s`}
            change="Optimized performance"
            isPositive={true}
            size="large"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Over Time */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Traffic Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="unique" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Analytics & Top Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Device Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="device" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="visitors" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
            <h3 className="text-white text-lg font-semibold mb-4">Top Pages</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Page</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Views</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Avg Time</th>
                    <th className="text-right py-3 text-gray-400 font-medium">Bounce Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((page, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 font-mono text-blue-400">{page.page}</td>
                      <td className="text-right py-3 text-white font-medium">{page.views.toLocaleString()}</td>
                      <td className="text-right py-3 text-gray-300">{page.time}</td>
                      <td className="text-right py-3 text-gray-300">{page.bounce}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-400" />
            Geographic Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {geoData.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <span className="font-medium text-white">{country.country}</span>
                </div>
                <span className="font-semibold text-blue-400">{country.visitors}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Real-time Activity
            <div className="ml-3 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="ml-2 text-sm text-gray-400">Live</span>
            </div>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-gray-300">New visitor from New York, US</span>
              </div>
              <span className="text-sm text-gray-500">2 seconds ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-gray-300">Page view: /products/analytics-dashboard</span>
              </div>
              <span className="text-sm text-gray-500">5 seconds ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                <span className="text-gray-300">High engagement session detected (8+ pages)</span>
              </div>
              <span className="text-sm text-gray-500">12 seconds ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
