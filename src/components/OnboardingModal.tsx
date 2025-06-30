import React, { useState } from 'react';
import { CURRENCIES } from '../utils/currency';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (currency: string) => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const handleComplete = () => {
    onComplete(selectedCurrency);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-[var(--surface)] rounded-lg w-full max-w-md border border-gray-700 animate-slide-up">
        <div className="p-6 text-center">
          <div className="mb-6">
            <img src="/pwa-192x192.png" alt="SpendingAgain" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Welcome to SpendingAgain</h1>
            <p className="text-gray-400">
              A minimalist, local-first expense tracker. Your data stays private and secure on your device.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Choose your default currency:</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-3 input-focus text-center text-lg"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleComplete}
            className="w-full button-primary py-3 rounded-lg font-medium text-lg"
          >
            Get Started
          </button>

          <p className="text-xs text-gray-500 mt-4">
            You can change this later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}