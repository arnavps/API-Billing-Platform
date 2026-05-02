import React, { useState, useEffect } from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { Check, Zap, Rocket, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CheckoutModal } from '../../components/billing/CheckoutModal';

const PlansPage: React.FC = () => {
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
          className="text-4xl md:text-5xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-400"
        >
          Choose the perfect plan for your business scale.
        </motion.p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-8 gap-4">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-gray-800 rounded-full relative p-1 transition-colors hover:bg-gray-700"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
              className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
            Yearly <span className="text-green-400 ml-1 text-xs font-bold">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-3xl border ${
              plan.name.toLowerCase() === 'pro' 
                ? 'bg-gradient-to-b from-blue-900/20 to-gray-950 border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-105 z-10' 
                : 'bg-gray-950 border-gray-800'
            }`}
          >
            {plan.name.toLowerCase() === 'pro' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm h-10">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-white">${(billingCycle === 'yearly' ? plan.price * 0.8 : plan.price) / 100}</span>
              <span className="text-gray-500 ml-2">/mo</span>
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              className={`w-full py-4 rounded-xl font-bold transition-all mb-8 flex items-center justify-center gap-2 group ${
                plan.name.toLowerCase() === 'pro'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">What's included</p>
              {plan.features.map((feature: string, fIndex: number) => (
                <div key={fIndex} className="flex items-center gap-3">
                  <div className="p-1 bg-blue-500/10 rounded-full">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table Section */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Compare features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-6 px-4 text-left text-gray-400 font-medium">Feature</th>
                {plans.map(plan => (
                  <th key={plan._id} className="py-6 px-4 text-center text-white font-bold">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-900">
                <td className="py-6 px-4 text-gray-300">Requests per month</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-4 text-center text-gray-400">{plan.requestsQuota.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-900">
                <td className="py-6 px-4 text-gray-300">API Gateway Overhead</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-4 text-center text-gray-400">&lt; 50ms</td>
                ))}
              </tr>
              <tr className="border-b border-gray-900">
                <td className="py-6 px-4 text-gray-300">Advanced Analytics</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-4 text-center">
                    {plan.name !== 'Free' ? <Check className="w-5 h-5 text-blue-400 mx-auto" /> : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-900">
                <td className="py-6 px-4 text-gray-300">Custom Rate Limits</td>
                {plans.map(plan => (
                  <td key={plan._id} className="py-6 px-4 text-center">
                    {plan.name === 'Enterprise' ? <Check className="w-5 h-5 text-blue-400 mx-auto" /> : '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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

export default PlansPage;
