import React, { useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Clock, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useAPIStore } from '../../store/useAPIStore';

interface AnalyticsTabProps {
  api: any;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ api }) => {
  const { analyticsData, isAnalyticsLoading, fetchAPIAnalytics } = useAPIStore();

  useEffect(() => {
    fetchAPIAnalytics(api._id);
  }, [api._id, fetchAPIAnalytics]);

  if (isAnalyticsLoading && analyticsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  // Format data for charts
  const chartData = analyticsData.map(item => ({
    name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    requests: item.requests,
    errors: item.errors,
    latency: Math.round(item.avgLatency)
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Real-time</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-white">{api.analytics.totalRequests.toLocaleString()}</p>
        </div>

        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Avg</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Avg. Latency</p>
          <p className="text-2xl font-bold text-white">{api.analytics.avgResponseTime}ms</p>
        </div>

        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">7d</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Error Rate</p>
          <p className="text-2xl font-bold text-white">
            {((api.analytics.failedRequests / (api.analytics.totalRequests || 1)) * 100).toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Active</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
          <p className="text-2xl font-bold text-white capitalize">{api.status}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Volume */}
        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Request Volume (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Times */}
        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Average Latency (ms)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rates */}
        <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Error Frequency</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#1f2937' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                />
                <Bar 
                  dataKey="errors" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
