import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AIAssistant } from './components/AIAssistant';
import { Settings } from './components/Settings';
import { OnboardingModal } from './components/OnboardingModal';
import { useDatabase } from './hooks/useDatabase';
import { Transaction, Settings as SettingsType } from './types';
import { fetchExchangeRates } from './utils/currency';

function App() {
  const {
    isInitialized,
    transactions,
    categories,
    settings,
    exchangeRates,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    saveSettings,
    saveExchangeRates,
    clearAllData
  } = useDatabase();

  const [currentView, setCurrentView] = useState('dashboard');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // Check for first-time user
  useEffect(() => {
    if (isInitialized && !settings) {
      setShowOnboarding(true);
    }
  }, [isInitialized, settings]);

  // Fetch exchange rates on app load
  useEffect(() => {
    if (settings && !exchangeRates) {
      fetchExchangeRates(settings.defaultCurrency).then(rates => {
        if (rates) {
          saveExchangeRates(rates);
        }
      });
    }
  }, [settings, exchangeRates, saveExchangeRates]);

  const handleViewChange = (view: string) => {
    if (view === 'add') {
      setEditingTransaction(null);
      setShowTransactionModal(true);
    } else {
      setCurrentView(view);
    }
  };

  const handleOnboardingComplete = async (currency: string) => {
    const newSettings: SettingsType = {
      id: 'main',
      defaultCurrency: currency,
      aiApiKey: '',
      aiEndpoint: 'https://api.openai.com/v1/chat/completions',
      aiModel: 'gpt-3.5-turbo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveSettings(newSettings);
    setShowOnboarding(false);

    // Fetch exchange rates for the selected currency
    const rates = await fetchExchangeRates(currency);
    if (rates) {
      saveExchangeRates(rates);
    }
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      if (editingTransaction) {
        await updateTransaction(transaction);
      } else {
        await addTransaction(transaction);
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleSendMessage = (message: string) => {
    setChatInput('');
    // Message handling is done in AIAssistant component
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text)]">Initializing SpendingAgain...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            exchangeRates={exchangeRates}
            defaultCurrency={settings?.defaultCurrency || 'USD'}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'ai':
        return (
          <AIAssistant
            transactions={transactions}
            settings={settings}
            onAddTransaction={addTransaction}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            categories={categories}
            exchangeRates={exchangeRates}
            transactions={transactions}
            onSaveSettings={saveSettings}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            onSaveExchangeRates={saveExchangeRates}
            onClearAllData={clearAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        currentView={currentView}
        onViewChange={handleViewChange}
        showChatInput={currentView === 'ai'}
        onSendMessage={handleSendMessage}
        chatInputValue={chatInput}
        onChatInputChange={setChatInput}
      >
        {renderCurrentView()}
      </Layout>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        defaultCurrency={settings?.defaultCurrency || 'USD'}
        editingTransaction={editingTransaction}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}

export default App;