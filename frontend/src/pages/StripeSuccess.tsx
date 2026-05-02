import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBillingStore } from '../store/useBillingStore';

const StripeSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchSubscription } = useBillingStore();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Refresh subscription data to show updated plan
      fetchSubscription();
    }
  }, [sessionId, fetchSubscription]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-emerald-500/10 p-6 rounded-full mb-8"
      >
        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto mb-10">
          Thank you for your subscription. Your account has been upgraded and your new limits are now active.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard/settings/billing')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Go to Billing
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700"
          >
            Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StripeSuccess;
