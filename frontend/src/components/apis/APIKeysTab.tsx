import React, { useEffect, useState } from 'react';
import { 
  Key, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Shield, 
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useAPIKeyStore } from '../../store/useAPIKeyStore';

interface APIKeysTabProps {
  apiId: string;
}

export const APIKeysTab: React.FC<APIKeysTabProps> = ({ apiId }) => {
  const { keys, isLoading, fetchKeys, createKey, rotateKey, revokeKey } = useAPIKeyStore();
  const [showKeyModal, setShowKeyModal] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchKeys(apiId);
  }, [apiId, fetchKeys]);

  const handleCreateKey = async () => {
    setIsCreating(true);
    const result = await createKey(apiId, {
      name: `Key ${new Date().toLocaleDateString()}`,
      type: 'test',
    });
    setIsCreating(false);
    if (result) {
      setShowKeyModal(result);
    }
  };

  const handleRotateKey = async (keyId: string) => {
    const result = await rotateKey(apiId, keyId);
    if (result) {
      setShowKeyModal(result.newApiKey);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'revoked': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <span>Manage Access Keys</span>
          </h3>
          <p className="text-sm text-gray-500">Authentication keys for your consumers to access this API.</p>
        </div>
        <button 
          onClick={handleCreateKey}
          disabled={isCreating}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>Generate Key</span>
        </button>
      </div>

      {/* Keys Table/List */}
      {isLoading && keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-900 border border-gray-800 rounded-3xl">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Loading keys...</p>
        </div>
      ) : keys.length > 0 ? (
        <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-dark-950/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Name & Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">API Key</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Last Used</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {keys.map((key) => (
                  <tr key={key._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-sm mb-1">{key.name}</span>
                        <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          key.type === 'live' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {key.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-dark-950 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300">
                          {key.prefix}••••••••{key.lastFour}
                        </code>
                        <button 
                          className="p-1.5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => {
                            // Copy prefix+lastFour just as a placeholder or copy the key if we had it
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never used'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {key.status === 'active' && (
                          <>
                            <button 
                              onClick={() => handleRotateKey(key._id)}
                              className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                              title="Rotate Key"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => revokeKey(apiId, key._id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                              title="Revoke Key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-dark-800 rounded-lg">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-900 border border-dashed border-gray-800 rounded-3xl text-center px-4">
          <div className="p-4 bg-primary/10 rounded-2xl mb-6">
            <Key className="h-10 w-10 text-primary" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No API keys found</h4>
          <p className="text-gray-400 max-w-xs mb-8 text-sm">Create your first access key to start making requests through this API proxy.</p>
          <button 
            onClick={handleCreateKey}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Generate First Key</span>
          </button>
        </div>
      )}

      {/* Security Tip */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start space-x-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Shield className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-400 mb-1">Key Rotation Best Practices</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            We recommend rotating your API keys every 90 days. When you rotate a key, the old one will remain active for a 7-day grace period to prevent downtime.
          </p>
        </div>
      </div>

      {/* Success Modal (Key Display) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-dark-900 border border-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Key className="h-32 w-32 text-primary rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <Check className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Key Generated!</h3>
                  <p className="text-gray-400 text-sm">Your new API key is ready to use.</p>
                </div>
              </div>

              <div className="bg-dark-950 border border-primary/30 rounded-2xl p-6 mb-6">
                <label className="block text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">API Access Key</label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-dark-900 border border-gray-800 rounded-xl py-3.5 px-4 font-mono text-sm text-white overflow-x-auto whitespace-nowrap custom-scrollbar">
                    {showKeyModal.key}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(showKeyModal.key)}
                    className="p-3.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-[11px] text-yellow-400 bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Save this key now. It will not be shown again for security reasons.</span>
                </div>
              </div>

              <button 
                onClick={() => setShowKeyModal(null)}
                className="w-full py-4 bg-dark-800 hover:bg-dark-700 text-white border border-gray-700 rounded-2xl font-bold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
