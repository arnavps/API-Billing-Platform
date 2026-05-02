import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Settings, 
  Lock, 
  DollarSign, 
  Info,
  Globe,
  Shield,
  Clock,
  RefreshCw,
  Zap,
  Loader2,
  Key,
  AlertCircle,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useAPIStore } from '../../store/useAPIStore';

const categories = [
  { id: 'data', label: 'Data', icon: '📊' },
  { id: 'ai', label: 'AI & ML', icon: '🤖' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'social', label: 'Social', icon: '🌐' },
  { id: 'weather', label: 'Weather', icon: '🌤️' },
  { id: 'crypto', label: 'Crypto', icon: '₿' },
  { id: 'other', label: 'Other', icon: '📦' },
];

const authTypes = [
  { id: 'api_key', label: 'API Key', desc: 'Secure headers-based key authentication' },
  { id: 'bearer', label: 'Bearer Token', desc: 'Standard Authorization: Bearer token' },
  { id: 'oauth', label: 'OAuth 2.0', desc: 'Client Credentials flow (advanced)' },
  { id: 'none', label: 'No Auth', desc: 'Public API without authentication' },
];

export const CreateAPIWizard: React.FC = () => {
  const navigate = useNavigate();
  const { createAPI, isLoading: isCreating } = useAPIStore();
  const [step, setStep] = useState(1);
  const [createdAPI, setCreatedAPI] = useState<any>(null);
  const [showKey, setShowKey] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⚡',
    category: 'data',
    baseUrl: '',
    visibility: 'private',
    configuration: {
      timeout: 30000,
      retries: 3,
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      },
      authentication: {
        type: 'api_key',
        headers: {},
      },
    },
    pricing: {
      model: 'free',
      freeQuota: 1000,
      pricePerRequest: 0,
    }
  });

  const updateFormData = (path: string, value: any) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [keys[0]]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({ 
        ...prev, 
        [keys[0]]: { ...prev[keys[0] as keyof typeof prev] as any, [keys[1]]: value } 
      }));
    } else if (keys.length === 3) {
      setFormData(prev => {
        const first = prev[keys[0] as keyof typeof prev] as any;
        return {
          ...prev,
          [keys[0]]: {
            ...first,
            [keys[1]]: { ...first[keys[1]], [keys[2]]: value }
          }
        };
      });
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    const result = await createAPI(formData);
    if (result) {
      setCreatedAPI(result);
      setStep(6); // Success step
    }
  };

  const renderStepIcon = (s: number, icon: any) => (
    <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-300 ${
      step > s ? 'bg-primary border-primary text-white' : 
      step === s ? 'border-primary text-primary bg-primary/10 shadow-lg shadow-primary/20' : 
      'border-gray-800 text-gray-500 bg-dark-900'
    }`}>
      {step > s ? <Check className="h-5 w-5" /> : icon}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs/Steps */}
        {step < 6 && (
          <div className="mb-12">
            <button 
              onClick={() => navigate('/apis')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to APIs</span>
            </button>
            <div className="flex items-center justify-between relative px-4">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
              {[
                { s: 1, icon: <Info className="h-5 w-5" />, label: 'Basic Info' },
                { s: 2, icon: <Settings className="h-5 w-5" />, label: 'Config' },
                { s: 3, icon: <Shield className="h-5 w-5" />, label: 'Auth' },
                { s: 4, icon: <DollarSign className="h-5 w-5" />, label: 'Pricing' },
                { s: 5, icon: <Check className="h-5 w-5" />, label: 'Review' },
              ].map((item) => (
                <div key={item.s} className="relative z-10 flex flex-col items-center">
                  {renderStepIcon(item.s, item.icon)}
                  <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                    step === item.s ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-dark-900 border border-gray-800 rounded-3xl p-8 shadow-xl shadow-black/50 overflow-hidden relative">
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                <p className="text-gray-400 text-sm">Let's start with the name and category of your API.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">API Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Weather Intelligence"
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe what this API does..."
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Icon (Emoji or URL)</label>
                    <div className="flex space-x-2">
                      <div className="h-12 w-12 bg-dark-950 border border-gray-800 rounded-xl flex items-center justify-center text-2xl">
                        {formData.icon}
                      </div>
                      <input 
                        type="text"
                        className="flex-1 bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                        value={formData.icon}
                        onChange={(e) => updateFormData('icon', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => updateFormData('category', cat.id)}
                          title={cat.label}
                          className={`p-2 rounded-xl border transition-all text-xl ${
                            formData.category === cat.id 
                              ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' 
                              : 'bg-dark-950 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {cat.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">API Configuration</h2>
                <p className="text-gray-400 text-sm">Configure the technical details of your endpoint proxy.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Target Base URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="https://api.yourdomain.com/v1"
                      className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.baseUrl}
                      onChange={(e) => updateFormData('baseUrl', e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">MeterFlow will proxy requests to this URL.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Timeout (ms)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="number"
                        className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                        value={formData.configuration.timeout}
                        onChange={(e) => updateFormData('configuration.timeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Max Retries</label>
                    <div className="relative">
                      <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="number"
                        className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                        value={formData.configuration.retries}
                        onChange={(e) => updateFormData('configuration.retries', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Visibility</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateFormData('visibility', 'private')}
                      className={`flex-1 p-4 rounded-xl border flex items-center space-x-3 transition-all ${
                        formData.visibility === 'private' 
                          ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/5' 
                          : 'bg-dark-950 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <Lock className={`h-5 w-5 ${formData.visibility === 'private' ? 'text-primary' : ''}`} />
                      <div className="text-left">
                        <p className="font-bold">Private</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Internal Use</p>
                      </div>
                    </button>
                    <button
                      onClick={() => updateFormData('visibility', 'public')}
                      className={`flex-1 p-4 rounded-xl border flex items-center space-x-3 transition-all ${
                        formData.visibility === 'public' 
                          ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/5' 
                          : 'bg-dark-950 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <Globe className={`h-5 w-5 ${formData.visibility === 'public' ? 'text-primary' : ''}`} />
                      <div className="text-left">
                        <p className="font-bold">Public</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Available to all</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Authentication */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Authentication Method</h2>
                <p className="text-gray-400 text-sm">Choose how consumers will authenticate with your API.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {authTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => updateFormData('configuration.authentication.type', type.id)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                      formData.configuration.authentication.type === type.id 
                        ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/5' 
                        : 'bg-dark-950 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        formData.configuration.authentication.type === type.id ? 'bg-primary text-white' : 'bg-dark-800 text-gray-500 group-hover:text-white'
                      }`}>
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">{type.label}</p>
                        <p className="text-sm opacity-60">{type.desc}</p>
                      </div>
                    </div>
                    {formData.configuration.authentication.type === type.id && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Pricing & Quotas</h2>
                <p className="text-gray-400 text-sm">Define the business model for this API.</p>
              </div>
              <div className="space-y-8">
                <div className="flex space-x-4">
                  {[
                    { id: 'free', label: 'Free', icon: Zap },
                    { id: 'pay_per_request', label: 'Pay As You Go', icon: DollarSign },
                  ].map(model => (
                    <button
                      key={model.id}
                      onClick={() => updateFormData('pricing.model', model.id)}
                      className={`flex-1 p-6 rounded-2xl border flex flex-col items-center space-y-3 transition-all ${
                        formData.pricing.model === model.id 
                          ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/5' 
                          : 'bg-dark-950 border-gray-800 text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      <model.icon className={`h-8 w-8 ${formData.pricing.model === model.id ? 'text-primary' : ''}`} />
                      <span className="font-bold">{model.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Free Monthly Quota</label>
                    <input 
                      type="number"
                      className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.pricing.freeQuota}
                      onChange={(e) => updateFormData('pricing.freeQuota', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Rate Limit (req/min)</label>
                    <input 
                      type="number"
                      className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.configuration.rateLimit.maxRequests}
                      onChange={(e) => updateFormData('configuration.rateLimit.maxRequests', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Final Review</h2>
                <p className="text-gray-400 text-sm">Check everything before deploying your API proxy.</p>
              </div>
              <div className="bg-dark-950 border border-gray-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-4 pb-4 border-b border-gray-800">
                  <div className="text-3xl p-3 bg-dark-900 rounded-xl border border-gray-700">{formData.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                    <p className="text-gray-500 text-sm">{formData.baseUrl}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Category</span>
                    <span className="text-white font-medium capitalize">{formData.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Visibility</span>
                    <span className="text-white font-medium capitalize">{formData.visibility}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Auth Type</span>
                    <span className="text-white font-medium capitalize">{formData.configuration.authentication.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Pricing Model</span>
                    <span className="text-white font-medium capitalize">{formData.pricing.model.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {step === 6 && createdAPI && (
            <div className="animate-in zoom-in-95 duration-500 text-center py-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 text-green-500 mb-6 shadow-lg shadow-green-500/20">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">API Created Successfully!</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your API <strong>{createdAPI.api.name}</strong> is now live and ready to receive requests.
              </p>
              
              {createdAPI.initialApiKey && (
                <div className="bg-dark-950 border border-primary/30 rounded-2xl p-6 mb-10 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Key className="h-20 w-20 text-primary" />
                  </div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Your Initial Test API Key</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-dark-900 border border-gray-800 rounded-xl py-3 px-4 font-mono text-sm text-white overflow-hidden overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {showKey ? createdAPI.initialApiKey.key : '••••••••••••••••••••••••••••••••'}
                    </div>
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="p-3 bg-dark-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                      {showKey ? <Lock className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                    </button>
                    <button 
                      className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
                      onClick={() => {
                        navigator.clipboard.writeText(createdAPI.initialApiKey.key);
                      }}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] text-yellow-400 font-medium flex items-center space-x-2 bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Copy this key now. For your security, we won't show it again.</span>
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate(`/apis/${createdAPI.api._id}`)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                  View API Dashboard
                </button>
                <button 
                  onClick={() => navigate('/apis')}
                  className="px-8 py-3 bg-dark-800 text-white border border-gray-700 rounded-xl font-bold hover:bg-dark-700 transition-all"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-800">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-400 hover:text-white font-bold transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}
              
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !formData.name}
                  className={`flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 ${
                    step === 1 && !formData.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-hover'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Zap className="h-5 w-5 fill-current" />
                  )}
                  <span>Deploy API Proxy</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
