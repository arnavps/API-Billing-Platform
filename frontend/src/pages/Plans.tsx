import React, { useEffect } from 'react';
import { useBillingStore } from '../store/useBillingStore';
import { Check, Zap, Rocket, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Plans: React.FC = () => {
  const { plans, loading, fetchPlans, createCheckout } = useBillingStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (planId: string) => {
    try {
      const url = await createCheckout(planId);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Pricing Plans</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Choose the perfect plan for your API scaling needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col p-8 rounded-2xl border ${
              plan.name.toLowerCase() === 'pro'
                ? 'bg-slate-800/80 border-indigo-500 shadow-xl shadow-indigo-500/10'
                : 'bg-slate-800/40 border-slate-700'
            }`}
          >
            {plan.name.toLowerCase() === 'pro' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm h-10">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-slate-400">/{plan.billingCycle}</span>
            </div>

            <div className="space-y-4 mb-12 flex-grow">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span>{plan.requestsQuota.toLocaleString()} requests/mo</span>
              </div>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan._id)}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                plan.name.toLowerCase() === 'pro'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Started'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-800 pt-16">
        <div className="text-center">
          <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Instant Setup</h4>
          <p className="text-slate-400 text-sm">Get your API keys and start processing requests in minutes.</p>
        </div>
        <div className="text-center">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Infinite Scale</h4>
          <p className="text-slate-400 text-sm">Scale from 1 to 1M+ requests without worrying about infrastructure.</p>
        </div>
        <div className="text-center">
          <div className="bg-amber-500/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h4 className="text-white font-semibold mb-2">Enterprise Security</h4>
          <p className="text-slate-400 text-sm">Bank-grade encryption and granular access controls for your data.</p>
        </div>
      </div>
    </div>
  );
};

export default Plans;
