import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, Category } from '../types';
import { CURRENCIES } from '../utils/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  defaultCurrency: string;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categories, 
  defaultCurrency,
  editingTransaction 
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    currency: defaultCurrency,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        category: editingTransaction.category,
        currency: editingTransaction.currency,
        date: editingTransaction.date
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        currency: defaultCurrency,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingTransaction, defaultCurrency, isOpen]);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      return;
    }

    const transaction: Transaction = {
      id: editingTransaction?.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      currency: formData.currency,
      date: formData.date,
      createdAt: editingTransaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(transaction);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="bg-[var(--surface)] rounded-lg w-full max-w-md border border-gray-700 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                formData.type === 'expense' 
                  ? 'bg-[var(--error)] text-white' 
                  : 'bg-[var(--background)] text-gray-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                formData.type === 'income' 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'bg-[var(--background)] text-gray-400'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              placeholder="What was this for?"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              required
            >
              <option value="">Select a category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 button-secondary py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 button-primary py-3 rounded-lg font-medium"
            >
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}