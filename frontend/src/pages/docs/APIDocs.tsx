import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocsStore } from '../../store/useDocsStore';
import { 
  ClipboardIcon, 
  CheckIcon, 
  BoltIcon,
  GlobeAltIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[method] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {method}
    </span>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-4">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={copyToClipboard}
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md border border-white/10 transition-all"
        >
          {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <ClipboardIcon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>
      <pre className="bg-surface-800 p-4 rounded-xl border border-white/5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export const APIDocs: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { fetchAPIDocs, currentAPI, loading, error } = useDocsStore();

  useEffect(() => {
    if (slug) fetchAPIDocs(slug);
  }, [slug, fetchAPIDocs]);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-8 bg-white/5 w-1/3 rounded-lg" />
    <div className="h-24 bg-white/5 rounded-2xl" />
    <div className="space-y-4">
      <div className="h-6 bg-white/5 w-1/4 rounded-md" />
      <div className="h-48 bg-white/5 rounded-2xl" />
    </div>
  </div>;

  if (error) return <div className="text-rose-400 bg-rose-400/10 p-4 rounded-xl border border-rose-400/20">
    {error}
  </div>;

  if (!currentAPI) return <div className="text-slate-400">API not found</div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-primary-500/20">
            {currentAPI.icon || '⚡'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{currentAPI.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1"><TagIcon className="w-4 h-4" /> {currentAPI.category}</span>
              <span className="flex items-center gap-1"><BoltIcon className="w-4 h-4" /> v{currentAPI.metadata?.version || '1.0.0'}</span>
              <span className="flex items-center gap-1"><GlobeAltIcon className="w-4 h-4" /> {currentAPI.visibility}</span>
            </div>
          </div>
        </div>
        <p className="text-lg text-slate-400 leading-relaxed max-w-3xl">
          {currentAPI.description}
        </p>
      </section>

      {/* Base URL */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Base URL
        </h2>
        <div className="bg-surface-800/50 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
          <code className="text-primary-400 font-mono">
            {`https://gateway.meterflow.com/proxy/${currentAPI.slug}`}
          </code>
          <button className="text-slate-500 hover:text-white transition-colors">
            <ClipboardIcon className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Endpoints */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Endpoints</h2>
        
        {currentAPI.endpoints && currentAPI.endpoints.length > 0 ? (
          <div className="space-y-12">
            {currentAPI.endpoints.map((endpoint: any, idx: number) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-4">
                  <MethodBadge method={endpoint.method} />
                  <code className="text-lg font-bold text-white">{endpoint.path}</code>
                </div>
                <p className="text-slate-400">{endpoint.description}</p>

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Parameters</h4>
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-surface-800/30">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-slate-400">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Type</th>
                            <th className="px-4 py-3 font-semibold">In</th>
                            <th className="px-4 py-3 font-semibold">Required</th>
                            <th className="px-4 py-3 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {endpoint.parameters.map((param: any, pIdx: number) => (
                            <tr key={pIdx} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-mono text-primary-400">{param.name}</td>
                              <td className="px-4 py-3 text-slate-400">{param.type}</td>
                              <td className="px-4 py-3 text-slate-400">{param.in}</td>
                              <td className="px-4 py-3">
                                {param.required ? (
                                  <span className="text-rose-400 font-bold">Yes</span>
                                ) : (
                                  <span className="text-slate-500">No</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-300">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Example Request</h4>
                    <CodeBlock 
                      language="bash"
                      code={`curl https://gateway.meterflow.com/proxy/${currentAPI.slug}${endpoint.path} \\
  -H "X-MF-API-Key: YOUR_API_KEY" ${endpoint.method !== 'GET' ? `\\\n  -d '${endpoint.requestBody?.example || '{}'}'` : ''}`}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Example Response</h4>
                    <CodeBlock 
                      language="json"
                      code={endpoint.responses?.[0]?.example || '{}'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl border-dashed border-white/10">
            <CodeBracketIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No endpoints defined for this API yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};
