import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useWebhookStore } from '../store/useWebhookStore';
import { useApiStore } from '../store/useApiStore';
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Settings2, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Play, 
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  AlertCircle
} from 'lucide-react';
import { CreateWebhookModal } from '../components/webhooks/CreateWebhookModal';
import { format } from 'date-fns';

export const Webhooks: React.FC = () => {
  const { 
    webhooks, 
    fetchWebhooks, 
    isLoading, 
    deleteWebhook, 
    testWebhook,
    fetchWebhookDeliveries,
    deliveries,
    isDeliveriesLoading
  } = useWebhookStore();
  
  const { apis, fetchApis } = useApiStore();
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWebhooks();
    fetchApis();
  }, [fetchWebhooks, fetchApis]);

  const handleTestWebhook = async (id: string) => {
    await testWebhook(id);
    // Show success toast here if toast system exists
  };

  const handleViewDeliveries = (id: string) => {
    setSelectedWebhook(id);
    fetchWebhookDeliveries(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              Webhooks & <span className="text-gradient">Events</span>
            </h1>
            <p className="text-gray-400 font-medium">Receive real-time notifications about your API events.</p>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-600/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create Webhook</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Webhooks List */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-bold">Loading webhooks...</p>
              </div>
            ) : webhooks.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                  <WebhookIcon className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No webhooks configured</h3>
                <p className="text-gray-400 max-w-sm mb-8">
                  Create a webhook to receive real-time updates when important events happen in your account.
                </p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-primary-400 font-black uppercase tracking-widest text-xs hover:text-primary-300 transition-colors"
                >
                  Create your first webhook
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {webhooks.map((webhook) => (
                  <div key={webhook._id} className={`glass-card p-6 border-l-4 transition-all hover:bg-white/[0.04] ${selectedWebhook === webhook._id ? 'border-primary-500 bg-white/[0.04]' : 'border-transparent'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          webhook.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          <WebhookIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-white text-lg truncate max-w-md">{webhook.url}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              webhook.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {webhook.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>{webhook.events.length} Events</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>{webhook.metadata?.apiId ? 'API Specific' : 'Account Level'}</span>
                            </div>
                            {webhook.lastTriggeredAt && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Last sent {format(new Date(webhook.lastTriggeredAt), 'MMM d, h:mm a')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewDeliveries(webhook._id)}
                          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                          title="View History"
                        >
                          <History className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleTestWebhook(webhook._id)}
                          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                          title="Test Webhook"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                        <div className="relative group">
                          <button className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 overflow-hidden">
                            <button className="w-full px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/5 flex items-center space-x-2">
                              <Settings2 className="h-4 w-4" />
                              <span>Edit Settings</span>
                            </button>
                            <button 
                              onClick={() => deleteWebhook(webhook._id)}
                              className="w-full px-4 py-3 text-left text-sm font-bold text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Endpoint</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {webhook.events.slice(0, 3).map((event) => (
                        <span key={event} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400">
                          {event}
                        </span>
                      ))}
                      {webhook.events.length > 3 && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400">
                          +{webhook.events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery History Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card flex flex-col h-[calc(100vh-250px)] sticky top-8">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black uppercase tracking-widest text-xs text-white">Delivery History</h3>
                  {selectedWebhook && (
                    <button 
                      onClick={() => fetchWebhookDeliveries(selectedWebhook)}
                      className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300"
                    >
                      Refresh
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 font-bold">Recent activity for selected endpoint.</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {!selectedWebhook ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Clock className="h-10 w-10 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-sm font-bold">Select a webhook to view delivery history.</p>
                  </div>
                ) : isDeliveriesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                  </div>
                ) : deliveries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <AlertCircle className="h-10 w-10 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-sm font-bold">No deliveries yet.</p>
                  </div>
                ) : (
                  deliveries.map((delivery) => (
                    <div key={delivery._id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {delivery.status === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            delivery.status === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {delivery.response?.status || (delivery.status === 'success' ? '200' : 'FAIL')}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {format(new Date(delivery.createdAt), 'HH:mm:ss')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 truncate">{delivery.event}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-500 font-bold">{delivery.payload.id || delivery._id.slice(-8)}</p>
                        <button className="text-[10px] font-black text-primary-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <span>Details</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedWebhook && (
                <div className="p-4 border-t border-white/10">
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors flex items-center justify-center space-x-2">
                    <ExternalLink className="h-3 w-3" />
                    <span>View All Logs</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateWebhookModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

