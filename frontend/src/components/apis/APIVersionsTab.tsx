import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  MoreVertical, 
  ExternalLink,
  History,
  Calendar,
  Code2,
  Trash2,
  Settings2,
  Loader2
} from 'lucide-react';
import { useAPIStore } from '../../store/useAPIStore';
import { motion, AnimatePresence } from 'framer-motion';

export const APIVersionsTab: React.FC<{ apiId: string }> = ({ apiId }) => {
  const { 
    versions, 
    isVersionsLoading, 
    isUpdating, 
    fetchAPIVersions, 
    createAPIVersion, 
    updateAPIVersion, 
    setCurrentVersion 
  } = useAPIStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVersion, setNewVersion] = useState({ version: '', baseUrl: '', changelog: '' });

  useEffect(() => {
    fetchAPIVersions(apiId);
  }, [apiId, fetchAPIVersions]);

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAPIVersion(apiId, newVersion);
    setShowAddModal(false);
    setNewVersion({ version: '', baseUrl: '', changelog: '' });
  };

  const handleSetCurrent = async (versionId: string) => {
    if (window.confirm('Are you sure you want to make this the current production version? This will update the default routing for all non-versioned requests.')) {
      await setCurrentVersion(apiId, versionId);
    }
  };

  const handleDeprecate = async (versionId: string, currentStatus: boolean) => {
    await updateAPIVersion(apiId, versionId, { isDeprecated: !currentStatus });
  };

  if (isVersionsLoading && versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-gray-400">Loading versions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <span>API Versioning</span>
          </h3>
          <p className="text-sm text-gray-500">Manage multiple deployments and release cycles for your API.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Version</span>
        </button>
      </div>

      <div className="bg-dark-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-950/50 border-b border-gray-800">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Version</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Base URL</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <AnimatePresence mode="popLayout">
                {versions.map((v, index) => (
                  <motion.tr 
                    key={v._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group hover:bg-white/5 transition-colors ${v.isDefault ? 'bg-primary/5' : ''}`}
                  >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs ${v.isDefault ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'}`}>
                        {v.version}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>{v.version}</span>
                          {v.isDefault && (
                            <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">CURRENT</span>
                          )}
                        </div>
                        {v.changelog && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{v.changelog}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs text-gray-400 bg-dark-950 px-2 py-1 rounded border border-gray-800 max-w-[200px] truncate">
                        {v.baseUrl}
                      </code>
                      <ExternalLink className="h-3 w-3 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {v.isDeprecated ? (
                      <div className="flex items-center space-x-1.5 text-yellow-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold uppercase tracking-tight">Deprecated</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-green-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold uppercase tracking-tight">Active</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-500 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {!v.isDefault && (
                        <button
                          onClick={() => handleSetCurrent(v._id)}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-dark-800 text-gray-300 rounded-lg text-xs font-bold border border-gray-700 hover:bg-dark-700 hover:text-white transition-all"
                        >
                          Set Current
                        </button>
                      )}
                      <button
                        onClick={() => handleDeprecate(v._id, v.isDeprecated)}
                        className={`p-2 rounded-lg transition-all ${v.isDeprecated ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-white hover:bg-dark-800'}`}
                        title={v.isDeprecated ? "Mark as Active" : "Deprecate"}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start space-x-3">
        <Settings2 className="h-5 w-5 text-blue-400 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-200 font-bold mb-1">Versioning Pro Tip</p>
          <p className="text-blue-300/80 leading-relaxed">
            Requests made to <code className="text-blue-200 bg-blue-400/10 px-1 rounded">/proxy/:slug/*</code> always route to the <strong>Current</strong> version. 
            To target a specific version, use <code className="text-blue-200 bg-blue-400/10 px-1 rounded">/proxy/:slug/:version/*</code>.
          </p>
        </div>
      </div>

      {/* Add Version Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-900 border border-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Create New Version</h3>
              </div>

              <form onSubmit={handleAddVersion} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Version String</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v2.0.0"
                    value={newVersion.version}
                    onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Target Base URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api-v2.yoursite.com"
                    value={newVersion.baseUrl}
                    onChange={(e) => setNewVersion({ ...newVersion, baseUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500">The destination where requests for this version will be forwarded.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Changelog / Notes</label>
                  <textarea
                    placeholder="What's new in this version?"
                    value={newVersion.changelog}
                    onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-dark-800 text-white rounded-xl font-bold border border-gray-700 hover:bg-dark-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Creating...' : 'Create Version'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
