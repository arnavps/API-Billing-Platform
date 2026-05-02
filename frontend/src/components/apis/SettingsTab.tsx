import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Save, 
  Globe, 
  Lock, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Zap,
  Info,
  Loader2
} from 'lucide-react';
import { useAPIStore } from '../../store/useAPIStore';

interface SettingsTabProps {
  api: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ api }) => {
  const { updateAPI, deleteAPI, isUpdating } = useAPIStore();
  const [formData, setFormData] = useState({
    name: api.name,
    description: api.description,
    baseUrl: api.baseUrl,
    visibility: api.visibility,
    status: api.status,
    configuration: {
      timeout: api.configuration.timeout,
      retries: api.configuration.retries,
      rateLimit: {
        enabled: api.configuration.rateLimit.enabled,
        maxRequests: api.configuration.rateLimit.maxRequests,
        windowMs: api.configuration.rateLimit.windowMs,
      }
    }
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAPI(api._id, formData);
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <section className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 bg-dark-950/50">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              General Configuration
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">API Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                <select 
                  value={api.category}
                  disabled
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-gray-500 focus:outline-none cursor-not-allowed"
                >
                  <option value={api.category}>{api.category.charAt(0).toUpperCase() + api.category.slice(1)}</option>
                </select>
                <p className="text-[10px] text-gray-600 italic">Category cannot be changed after creation.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Backend Base URL</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input 
                  type="url" 
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-600 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                This is the actual URL where requests will be proxied.
              </p>
            </div>
          </div>
        </section>

        {/* Proxy Performance */}
        <section className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 bg-dark-950/50">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              Proxy & Performance
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">Request Timeout</h4>
                    <p className="text-xs text-gray-500">Maximum time to wait for backend response.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      value={formData.configuration.timeout}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        configuration: { ...formData.configuration, timeout: parseInt(e.target.value) } 
                      })}
                      className="w-20 bg-dark-950 border border-gray-800 rounded-lg py-1.5 px-3 text-sm text-white text-right focus:outline-none focus:border-primary/50"
                    />
                    <span className="text-xs text-gray-600">ms</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">Retry Count</h4>
                    <p className="text-xs text-gray-500">Number of retries on network failure.</p>
                  </div>
                  <input 
                    type="number" 
                    max={5}
                    min={0}
                    value={formData.configuration.retries}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      configuration: { ...formData.configuration, retries: parseInt(e.target.value) } 
                    })}
                    className="w-20 bg-dark-950 border border-gray-800 rounded-lg py-1.5 px-3 text-sm text-white text-right focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">Rate Limiting</h4>
                    <p className="text-xs text-gray-500">Enable throttling for this API.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      configuration: {
                        ...formData.configuration,
                        rateLimit: { ...formData.configuration.rateLimit, enabled: !formData.configuration.rateLimit.enabled }
                      }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      formData.configuration.rateLimit.enabled ? 'bg-primary' : 'bg-dark-800'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.configuration.rateLimit.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {formData.configuration.rateLimit.enabled && (
                  <div className="p-4 bg-dark-950 border border-gray-800 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Max Requests</span>
                      <input 
                        type="number" 
                        value={formData.configuration.rateLimit.maxRequests}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          configuration: { 
                            ...formData.configuration, 
                            rateLimit: { ...formData.configuration.rateLimit, maxRequests: parseInt(e.target.value) } 
                          } 
                        })}
                        className="w-24 bg-dark-900 border border-gray-800 rounded-lg py-1 px-3 text-sm text-white text-right focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Window (ms)</span>
                      <input 
                        type="number" 
                        value={formData.configuration.rateLimit.windowMs}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          configuration: { 
                            ...formData.configuration, 
                            rateLimit: { ...formData.configuration.rateLimit, windowMs: parseInt(e.target.value) } 
                          } 
                        })}
                        className="w-24 bg-dark-900 border border-gray-800 rounded-lg py-1 px-3 text-sm text-white text-right focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isUpdating}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            <span>Save All Changes</span>
          </button>
        </div>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-3xl overflow-hidden mt-12">
          <div className="p-6 border-b border-red-500/10 bg-red-500/5">
            <h3 className="text-lg font-bold text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-white mb-1">Delete this API</h4>
              <p className="text-sm text-gray-500 max-w-md">
                Once you delete an API, all associated keys will be revoked and this proxy will stop working immediately. This action cannot be undone.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setIsDeleting(true)}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all whitespace-nowrap flex items-center space-x-2"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete API Proxy</span>
            </button>
          </div>
        </section>
      </form>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-dark-900 border border-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Are you absolutely sure?</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                This will permanently delete <strong>{api.name}</strong> and revoke all access keys. Your consumers will lose access immediately.
              </p>
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <button 
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 py-3.5 bg-dark-800 border border-gray-700 text-white rounded-2xl font-bold hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteAPI(api._id)}
                  className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Yes, Delete API
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
