import React, { useState, useEffect } from 'react';
import { useBillingStore } from '../store/useBillingStore';
import { Check, Zap, Rocket, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CheckoutModal } from '../components/billing/CheckoutModal';

const Plans: React.FC = () => {
  const { plans, fetchPlans, loading } = useBillingStore();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-gray-500"
        >
          Scale your API with confidence
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Simple pricing that scales with your growth. No hidden fees, no surprises.
        </motion.p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-10 gap-4">
          <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-gray-800 rounded-full relative p-1 transition-all hover:bg-gray-700 shadow-inner"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
              className="w-5 h-5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
            Yearly <span className="text-blue-400 ml-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full text-xs font-bold border border-blue-500/20">20% OFF</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 ${
              plan.name.toLowerCase() === 'pro' 
                ? 'bg-gradient-to-b from-blue-600/10 via-gray-950 to-gray-950 border-blue-500/50 shadow-[0_20px_50px_rgba(59,130,246,0.1)] scale-105 z-10' 
                : 'bg-gray-950 border-gray-800 hover:border-gray-700'
            }`}
          >
            {plan.name.toLowerCase() === 'pro' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl border border-white/10">
                Most Popular
              </div>
            )}

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${
                  plan.name.toLowerCase() === 'pro' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-900 text-gray-400'
                }`}>
                  {plan.name.toLowerCase() === 'free' ? <Shield className="w-6 h-6" /> : 
                   plan.name.toLowerCase() === 'pro' ? <Zap className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                </div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white tracking-tight">
                  ${(billingCycle === 'yearly' ? plan.price * 0.8 : plan.price) / 100}
                </span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
              {billingCycle === 'yearly' && plan.price > 0 && (
                <p className="text-blue-400 text-xs font-bold mt-2">Billed annually</p>
              )}
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              className={`w-full py-4.5 rounded-2xl font-bold transition-all mb-10 flex items-center justify-center gap-2 group/btn ${
                plan.name.toLowerCase() === 'pro'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_25px_rgba(59,130,246,0.3)]'
                  : 'bg-white hover:bg-gray-100 text-gray-950'
              }`}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-5">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Key Benefits</p>
              {plan.features.map((feature: string, fIndex: number) => (
                <div key={fIndex} className="flex items-start gap-3 group/feat">
                  <div className="mt-1 p-0.5 bg-blue-500/20 rounded-full transition-colors group-hover/feat:bg-blue-500/30">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-sm leading-tight transition-colors group-hover/feat:text-white">{feature}</span>
                </div>
              ))}
              <div className="flex items-start gap-3 group/feat">
                <div className="mt-1 p-0.5 bg-blue-500/20 rounded-full">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm leading-tight">
                  {plan.requestsQuota.toLocaleString()} requests/month
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 p-8 md:p-12 bg-gray-950 border border-gray-800 rounded-[3rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full -ml-48 -mb-48" />

        <h2 className="text-3xl font-bold text-white mb-16 text-center">Compare detailed features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-8 px-6 text-left text-gray-500 font-black uppercase tracking-widest text-[10px]">Infrastructure</th>
                {plans.map(plan => (
                  <th key={plan._id} className="py-8 px-6 text-center text-white font-bold text-lg">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-6 px-6 text-gray-300 font-medium">Monthly Requests</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-6 text-center text-gray-400 font-mono">
                    {plan.requestsQuota.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-6 px-6 text-gray-300 font-medium">Gateway Latency</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-6 text-center text-gray-400">
                    &lt; 50ms
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-6 px-6 text-gray-300 font-medium">Real-time Analytics</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-6 text-center">
                    {plan.name !== 'Free' ? <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-blue-400" /></div> : '-'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-6 px-6 text-gray-300 font-medium">Advanced Rate Limiting</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-6 text-center">
                    {plan.name === 'Enterprise' ? <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto"><Check className="w-4 h-4 text-blue-400" /></div> : '-'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-6 px-6 text-gray-300 font-medium">Support SLA</td>
                <td className="py-6 px-6 text-center text-gray-500">Community</td>
                <td className="py-6 px-6 text-center text-gray-400 font-medium">Priority (24h)</td>
                <td className="py-6 px-6 text-center text-blue-400 font-bold">VIP (1h)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedPlan && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default Plans;
