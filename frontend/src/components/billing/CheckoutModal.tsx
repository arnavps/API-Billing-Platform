import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBillingStore } from '../../store/useBillingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X, ShieldCheck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

const StripeForm = ({ plan, onSuccess, onCancel }: { plan: any, onSuccess: () => void, onCancel: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createCheckout } = useBillingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const data = await createCheckout(plan._id, 'stripe');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Selected Plan</span>
          <span className="text-white font-bold">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total</span>
          <span className="text-2xl font-bold text-blue-400">${plan.price / 100}</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-400">
          Card Details
        </label>
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl focus-within:border-blue-500 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Secure Checkout
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Payments are secured with Stripe. Your card information never touches our servers.
      </p>
    </form>
  );
};

const RazorpayCheckout = ({ plan, onSuccess, onCancel }: { plan: any, onSuccess: () => void, onCancel: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { createCheckout, fetchSubscription } = useBillingStore();
  const { user } = useAuthStore();

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const data = await createCheckout(plan._id, 'razorpay');
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'MeterFlow',
        description: `Subscription: ${plan.name}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          await fetchSubscription();
          onSuccess();
        },
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Selected Plan</span>
          <span className="text-white font-bold">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total</span>
          <span className="text-2xl font-bold text-blue-400">₹{plan.price / 100}</span>
        </div>
      </div>

      <button
        onClick={handleRazorpay}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Razorpay'}
      </button>
    </div>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-900/10 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-white">Complete your order</h2>
            <p className="text-sm text-gray-400">Secure payment via {gateway === 'stripe' ? 'Stripe' : 'Razorpay'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Gateway Selector */}
          <div className="flex gap-2 p-1 bg-gray-900 rounded-xl mb-6">
            <button
              onClick={() => setGateway('stripe')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                gateway === 'stripe' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Credit Card
            </button>
            <button
              onClick={() => setGateway('razorpay')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                gateway === 'razorpay' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              India (UPI/Netbanking)
            </button>
          </div>

          {gateway === 'stripe' ? (
            <Elements stripe={stripePromise}>
              <StripeForm plan={plan} onSuccess={() => {}} onCancel={onClose} />
            </Elements>
          ) : (
            <RazorpayCheckout plan={plan} onSuccess={() => {}} onCancel={onClose} />
          )}
        </div>
      </motion.div>
    </div>
  );
};
