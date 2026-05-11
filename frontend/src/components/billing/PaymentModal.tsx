import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing?success=true`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'An unexpected error occurred.');
      setProcessing(false);
    } else {
      setSucceeded(true);
      setProcessing(false);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Amount to Pay</span>
          <span className="text-white font-bold text-lg">
            ${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-400">
          <ShieldCheck className="w-3 h-3" />
          <span>Secure, encrypted payment via Stripe</span>
        </div>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs',
          theme: 'night',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0f172a',
            colorText: '#f8fafc',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          }
        }}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {succeeded ? (
        <div className="flex flex-col items-center justify-center py-4 text-emerald-400 gap-3">
          <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-300" />
          <p className="font-medium text-lg">Payment Succeeded!</p>
          <p className="text-sm text-slate-400">Updating your records</p>
        </div>
      ) : (
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-[2] py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            )}
          </button>
        </div>
      )}
    </form>
  );
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  clientSecret,
  amount,
  onSuccess,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Complete Payment</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onSuccess={onSuccess} 
                  onCancel={onClose}
                  amount={amount}
                />
              </Elements>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
