import React, { useState } from 'react';
import { Wallet, CreditCard, X, Calendar, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  price: number;
  title: string;
}

type PaymentStep = 'method' | 'card-details' | 'crypto-confirm' | 'processing' | 'success' | 'error';
type PaymentMethod = 'card' | 'crypto';

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, price, title }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Partial<CardDetails>>({});

  if (!isOpen) return null;

  const validateCardDetails = (): boolean => {
    const newErrors: Partial<CardDetails> = {};
    
    if (!cardDetails.number.match(/^\d{16}$/)) {
      newErrors.number = 'Invalid card number';
    }
    if (!cardDetails.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiry = 'Invalid expiry date (MM/YY)';
    }
    if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardSubmit = async () => {
    if (!validateCardDetails()) return;
    
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  const handleCryptoSubmit = async () => {
    setStep('processing');
    // Simulate transaction confirmation
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 16);
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const renderContent = () => {
    switch (step) {
      case 'method':
        return (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Choose Payment Method
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Register for {title}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{price} EX3</div>
                  <div className="text-sm text-gray-500">≈ $10.00 USD</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  setMethod('crypto');
                  setStep('crypto-confirm');
                }}
                className="w-full p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  <span>Pay with EX3 tokens</span>
                </div>
                <span className="text-sm opacity-70">Balance: 500 EX3</span>
              </button>

              <button 
                onClick={() => {
                  setMethod('card');
                  setStep('card-details');
                }}
                className="w-full p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-between hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Pay with credit card</span>
                </div>
                <span className="text-sm opacity-70">$10.00</span>
              </button>
            </div>
          </>
        );

      case 'card-details':
        return (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Enter Card Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({
                    ...prev,
                    number: formatCardNumber(e.target.value)
                  }))}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.number ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.number && (
                  <p className="mt-1 text-sm text-red-500">{errors.number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value)
                    }))}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.expiry ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails(prev => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                    }))}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.cvv ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4 mt-8">
                <button
                  onClick={() => setStep('method')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCardSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </>
        );

      case 'crypto-confirm':
        return (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Confirm Transaction
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold">{price} EX3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gas Fee</span>
                <span className="font-medium">~0.002 ETH</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <div className="text-right">
                    <div className="font-bold">{price} EX3</div>
                    <div className="text-sm text-gray-500">+ 0.002 ETH (gas)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setStep('method')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCryptoSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              >
                Confirm Payment
              </button>
            </div>
          </>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="mb-6 w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your registration has been confirmed.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="mb-6 w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              There was an error processing your payment.
            </p>
            <button
              onClick={() => setStep('method')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full relative animate-scale-up shadow-2xl">
        {step !== 'processing' && step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}