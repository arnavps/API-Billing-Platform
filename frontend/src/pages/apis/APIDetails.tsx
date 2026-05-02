import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Database, 
  Key, 
  BarChart3, 
  Clock, 
  Settings, 
  ChevronRight, 
  ExternalLink, 
  Play, 
  Activity, 
  AlertCircle, 
  Shield,
  Loader2,
  Code2,
  Layers
} from 'lucide-react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useAPIStore } from '../../store/useAPIStore';
import { APIKeysTab } from '../../components/apis/APIKeysTab';
import { AnalyticsTab } from '../../components/apis/AnalyticsTab';
import { LogsTab } from '../../components/apis/LogsTab';
import { SettingsTab } from '../../components/apis/SettingsTab';
import { TransformationsTab } from '../../components/apis/TransformationsTab';
import { APIVersionsTab } from '../../components/apis/APIVersionsTab';
import { TestAPIModal } from '../../components/apis/TestAPIModal';

export const APIDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAPI, isLoading, fetchAPIDetails, error } = useAPIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAPIDetails(id);
    }
  }, [id, fetchAPIDetails]);

  if (isLoading && !currentAPI) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Loading API details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentAPI) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-red-500/10 rounded-2xl mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">API Not Found</h3>
          <p className="text-gray-400 mb-8 max-w-sm">{error || "The API you're looking for doesn't exist or you don't have access."}</p>
          <button 
            onClick={() => navigate('/apis')}
            className="px-6 py-3 bg-dark-800 text-white border border-gray-700 rounded-xl font-bold hover:bg-dark-700 transition-all"
          >
            Back to APIs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Logs', icon: Clock },
    { id: 'versions', label: 'Versions', icon: Layers },
    { id: 'transformations', label: 'Transformations', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardLayout>
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/apis')} className="hover:text-white transition-colors">My APIs</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-300 font-medium">{currentAPI.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 bg-dark-900 border border-gray-800 rounded-3xl flex items-center justify-center text-4xl shadow-xl">
            {currentAPI.icon}
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-3xl font-extrabold text-white">{currentAPI.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                currentAPI.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {currentAPI.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span className="font-mono">/{currentAPI.slug}</span>
              <span className="h-1 w-1 rounded-full bg-gray-700" />
              <span className="capitalize">{currentAPI.category}</span>
              <span className="h-1 w-1 rounded-full bg-gray-700" />
              <div className="flex items-center space-x-1">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{currentAPI.baseUrl}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex-1 sm:flex-none px-5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl font-bold text-gray-300 hover:text-white hover:border-gray-700 transition-all">
            Documentation
          </button>
          <button 
            onClick={() => setShowTestModal(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center space-x-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Test API</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-gray-800 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-primary/5 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-dark-900/50 font-medium'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-dark-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Requests</p>
                    <p className="text-3xl font-extrabold text-white">{currentAPI.analytics.totalRequests.toLocaleString()}</p>
                    <div className="mt-3 flex items-center text-[11px] text-green-400 bg-green-400/10 w-fit px-2 py-0.5 rounded">
                      <Activity className="h-3 w-3 mr-1" />
                      <span>+12% vs last month</span>
                    </div>
                  </div>
                  <div className="bg-dark-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Avg. Latency</p>
                    <p className="text-3xl font-extrabold text-white">{currentAPI.analytics.avgResponseTime}ms</p>
                    <div className="mt-3 flex items-center text-[11px] text-blue-400 bg-blue-400/10 w-fit px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Consistent</span>
                    </div>
                  </div>
                  <div className="bg-dark-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Success Rate</p>
                    <p className="text-3xl font-extrabold text-white">
                      {currentAPI.analytics.totalRequests > 0 
                        ? ((currentAPI.analytics.successfulRequests / currentAPI.analytics.totalRequests) * 100).toFixed(1) 
                        : '100'}%
                    </p>
                    <div className="mt-3 flex items-center text-[11px] text-purple-400 bg-purple-400/10 w-fit px-2 py-0.5 rounded">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>99.9% uptime</span>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-white">Proxy Configuration</h3>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="text-primary text-sm font-bold hover:underline"
                    >
                      Edit Config
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Base URL</label>
                      <code className="text-sm text-gray-300 bg-dark-950 px-3 py-2 rounded-lg border border-gray-800 block truncate">
                        {currentAPI.baseUrl}
                      </code>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Timeout</label>
                      <span className="text-white font-medium">{currentAPI.configuration.timeout}ms</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Visibility</label>
                      <span className="text-white font-medium capitalize">{currentAPI.visibility}</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Rate Limit</label>
                      <span className="text-white font-medium">
                        {currentAPI.configuration.rateLimit.enabled 
                          ? `${currentAPI.configuration.rateLimit.maxRequests} req / ${currentAPI.configuration.rateLimit.windowMs / 1000}s` 
                          : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Pricing Model</h3>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Current Plan</span>
                      <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded capitalize">{currentAPI.pricing.model.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {currentAPI.pricing.model === 'free' ? '$0' : `$${currentAPI.pricing.pricePerRequest} / req`}
                    </p>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Free Quota</span>
                      <span className="text-gray-300 font-medium">{currentAPI.pricing.freeQuota.toLocaleString()} reqs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Billing Period</span>
                      <span className="text-gray-300 font-medium">Monthly</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-3 bg-dark-800 border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-dark-700 transition-all"
                  >
                    Manage Billing
                  </button>
                </div>

                <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm uppercase tracking-widest">Security</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Authentication is currently set to <strong>{currentAPI.configuration.authentication.type.replace('_', ' ')}</strong>.
                  </p>
                  <button 
                    onClick={() => setActiveTab('keys')}
                    className="w-full py-3 bg-dark-950 border border-gray-800 text-gray-400 rounded-xl text-sm font-bold hover:text-white hover:border-gray-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>Manage Access Keys</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && <APIKeysTab apiId={currentAPI._id} />}
        {activeTab === 'analytics' && <AnalyticsTab api={currentAPI} />}
        {activeTab === 'logs' && <LogsTab apiId={currentAPI._id} />}
        {activeTab === 'versions' && <APIVersionsTab apiId={currentAPI._id} />}
        {activeTab === 'transformations' && <TransformationsTab api={currentAPI} />}
        {activeTab === 'settings' && <SettingsTab api={currentAPI} />}
      </div>

      {/* Test API Modal */}
      {showTestModal && (
        <TestAPIModal 
          api={currentAPI} 
          onClose={() => setShowTestModal(false)} 
        />
      )}
    </DashboardLayout>
  );
};
