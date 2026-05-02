import React, { useState } from 'react';
import { useWebhookStore } from '../../store/useWebhookStore';
import { useApiStore } from '../../store/useApiStore';
import { X, Globe, Shield, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_EVENTS = [
  { id: 'usage.warning', label: 'Usage Warning (80%)', description: 'Triggered when usage reaches 80% of quota.' },
  { id: 'usage.exceeded', label: 'Usage Exceeded', description: 'Triggered when usage limit is reached.' },
  { id: 'rate_limit.hit', label: 'Rate Limit Hit', description: 'Triggered when a request is throttled.' },
  { id: 'payment.succeeded', label: 'Payment Succeeded', description: 'Triggered after a successful billing cycle.' },
  { id: 'payment.failed', label: 'Payment Failed', description: 'Triggered when a payment attempt fails.' },
  { id: 'api.created', label: 'API Created', description: 'Triggered when a new API is added.' },
  { id: 'key.created', label: 'Key Created', description: 'Triggered when a new API key is generated.' },
  { id: 'key.revoked', label: 'Key Revoked', description: 'Triggered when an API key is disabled.' },
];

export const CreateWebhookModal: React.FC<CreateWebhookModalProps> = ({ isOpen, onClose }) => {
  const { createWebhook, isLoading, error, clearError } = useWebhookStore();
  const { apis } = useApiStore();
  
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedApi, setSelectedApi] = useState<string>('all');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebhook({
        url,
        events: selectedEvents,
        metadata: selectedApi !== 'all' ? { apiId: selectedApi } : {}
      });
      onClose();
    } catch (err) {
      // Error handled by store
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Create <span className="text-gradient">Webhook</span></h2>
            <p className="text-gray-400 text-sm font-medium">Configure an endpoint to receive event notifications.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 animate-in shake duration-500">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <Globe className="h-3.5 w-3.5" />
              <span>Endpoint URL</span>
            </label>
            <input 
              type="url"
              required
              placeholder="https://your-api.com/webhooks"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary-500 transition-colors font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 font-bold">Must be a secure HTTPS URL.</p>
          </div>

          {/* API Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <Activity className="h-3.5 w-3.5" />
              <span>API Scope</span>
            </label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary-500 transition-colors font-bold appearance-none cursor-pointer"
              value={selectedApi}
              onChange={(e) => setSelectedApi(e.target.value)}
            >
              <option value="all">All APIs (Account-wide)</option>
              {apis.map(api => (
                <option key={api._id} value={api._id}>{api.name}</option>
              ))}
            </select>
          </div>

          {/* Event Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Events to Track</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_EVENTS.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  className={`p-4 text-left border rounded-2xl transition-all group ${
                    selectedEvents.includes(event.id)
                      ? 'bg-primary-500/10 border-primary-500/30'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-black uppercase tracking-tight ${
                      selectedEvents.includes(event.id) ? 'text-primary-400' : 'text-gray-300'
                    }`}>
                      {event.label}
                    </span>
                    {selectedEvents.includes(event.id) && (
                      <CheckCircle2 className="h-4 w-4 text-primary-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium leading-tight">
                    {event.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading || !url || selectedEvents.length === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-600/20"
            >
              {isLoading ? 'Creating...' : 'Create Endpoint'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
