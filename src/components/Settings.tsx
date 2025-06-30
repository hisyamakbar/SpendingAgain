import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Trash2, Plus, X } from 'lucide-react';
import { Settings as SettingsType, Category, ExchangeRate } from '../types';
import { CURRENCIES, fetchExchangeRates } from '../utils/currency';
import { exportToCSV } from '../utils/export';

interface SettingsProps {
  settings: SettingsType | null;
  categories: Category[];
  exchangeRates: ExchangeRate | null;
  transactions: any[];
  onSaveSettings: (settings: SettingsType) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onSaveExchangeRates: (rates: ExchangeRate) => void;
  onClearAllData: () => void;
}

export function Settings({
  settings,
  categories,
  exchangeRates,
  transactions,
  onSaveSettings,
  onAddCategory,
  onDeleteCategory,
  onSaveExchangeRates,
  onClearAllData
}: SettingsProps) {
  const [formData, setFormData] = useState({
    defaultCurrency: 'USD',
    aiApiKey: '',
    aiEndpoint: 'https://api.openai.com/v1/chat/completions',
    aiModel: 'gpt-3.5-turbo'
  });
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'income' | 'expense' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        defaultCurrency: settings.defaultCurrency,
        aiApiKey: settings.aiApiKey,
        aiEndpoint: settings.aiEndpoint,
        aiModel: settings.aiModel
      });
    }
  }, [settings]);

  const handleSaveSettings = () => {
    const newSettings: SettingsType = {
      id: 'main',
      defaultCurrency: formData.defaultCurrency,
      aiApiKey: formData.aiApiKey,
      aiEndpoint: formData.aiEndpoint,
      aiModel: formData.aiModel,
      createdAt: settings?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSaveSettings(newSettings);
  };

  const handleRefreshRates = async () => {
    setIsRefreshingRates(true);
    try {
      const rates = await fetchExchangeRates(formData.defaultCurrency);
      if (rates) {
        onSaveExchangeRates(rates);
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
    } finally {
      setIsRefreshingRates(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCategory.name.trim(),
      type: newCategory.type,
      createdAt: new Date().toISOString()
    };

    onAddCategory(category);
    setNewCategory({ name: '', type: 'expense' });
    setShowAddCategory(false);
  };

  const handleExportData = () => {
    exportToCSV(transactions);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearAllData();
    }
  };

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Currency Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Currency Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Currency</label>
            <select
              value={formData.defaultCurrency}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultCurrency: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveSettings}
            className="button-primary px-4 py-2 rounded-lg font-medium"
          >
            Save Currency Settings
          </button>
        </div>
      </div>

      {/* Exchange Rates */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Exchange Rates</h2>
          <button
            onClick={handleRefreshRates}
            disabled={isRefreshingRates}
            className="button-secondary px-3 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <RefreshCw size={16} className={isRefreshingRates ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        
        {exchangeRates ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              Last updated: {new Date(exchangeRates.lastUpdated).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              Base currency: {exchangeRates.baseCurrency}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(exchangeRates.rates).slice(0, 12).map(([currency, rate]) => (
                <div key={currency} className="flex justify-between">
                  <span>{currency}:</span>
                  <span>{rate.toFixed(4)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
                Rates By Exchange Rate API
              </a>
            </p>
          </div>
        ) : (
          <p className="text-gray-400">No exchange rates loaded. Click refresh to fetch current rates.</p>
        )}
      </div>

      {/* AI Configuration */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">AI Assistant Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={formData.aiApiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, aiApiKey: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              placeholder="Enter your AI API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Endpoint</label>
            <input
              type="url"
              value={formData.aiEndpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, aiEndpoint: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Model Name</label>
            <input
              type="text"
              value={formData.aiModel}
              onChange={(e) => setFormData(prev => ({ ...prev, aiModel: e.target.value }))}
              className="w-full bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              placeholder="gpt-3.5-turbo"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="button-primary px-4 py-2 rounded-lg font-medium"
          >
            Save AI Settings
          </button>
        </div>
      </div>

      {/* Category Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className="button-primary px-3 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {showAddCategory && (
          <div className="mb-4 p-4 bg-[var(--background)] border border-gray-600 rounded-lg">
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 bg-[var(--surface)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
                placeholder="Category name"
              />
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as any }))}
                className="bg-[var(--surface)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="button-primary px-3 py-2 rounded-lg font-medium"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="button-secondary px-3 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {['income', 'expense'].map(type => (
            <div key={type}>
              <h3 className="text-sm font-medium text-gray-400 mb-2 capitalize">{type} Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {categories
                  .filter(cat => cat.type === type)
                  .map(category => (
                    <div key={category.id} className="flex items-center justify-between bg-[var(--background)] border border-gray-600 rounded-lg px-3 py-2">
                      <span>{category.name}</span>
                      <button
                        onClick={() => onDeleteCategory(category.id)}
                        className="text-gray-400 hover:text-[var(--error)] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="button-secondary px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Download size={16} />
            Export to CSV
          </button>
          <button
            onClick={handleClearData}
            className="button-danger px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}