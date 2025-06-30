import { useState, useEffect } from 'react';
import { db } from '../utils/database';
import { Transaction, Category, Settings, ExchangeRate } from '../types';

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await db.init();
      await loadData();
      await initializeDefaultData();
      setIsInitialized(true);
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  };

  const loadData = async () => {
    try {
      const [txns, cats, setts, rates] = await Promise.all([
        db.getAllTransactions(),
        db.getAllCategories(),
        db.getSettings(),
        db.getExchangeRates()
      ]);

      setTransactions(txns);
      setCategories(cats);
      setSettings(setts);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const initializeDefaultData = async () => {
    try {
      const existingCategories = await db.getAllCategories();
      if (existingCategories.length === 0) {
        const defaultCategories: Category[] = [
          // Expense categories
          { id: 'food', name: 'Food', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'transport', name: 'Transport', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'entertainment', name: 'Entertainment', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'shopping', name: 'Shopping', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'bills', name: 'Bills', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'healthcare', name: 'Healthcare', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'education', name: 'Education', type: 'expense', createdAt: new Date().toISOString() },
          { id: 'other-expense', name: 'Other', type: 'expense', createdAt: new Date().toISOString() },
          // Income categories
          { id: 'salary', name: 'Salary', type: 'income', createdAt: new Date().toISOString() },
          { id: 'freelance', name: 'Freelance', type: 'income', createdAt: new Date().toISOString() },
          { id: 'investment', name: 'Investment', type: 'income', createdAt: new Date().toISOString() },
          { id: 'gift', name: 'Gift', type: 'income', createdAt: new Date().toISOString() },
          { id: 'other-income', name: 'Other', type: 'income', createdAt: new Date().toISOString() }
        ];

        for (const category of defaultCategories) {
          await db.addCategory(category);
        }
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      await db.addTransaction(transaction);
      setTransactions(prev => [...prev, transaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await db.updateTransaction(transaction);
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await db.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const addCategory = async (category: Category) => {
    try {
      await db.addCategory(category);
      setCategories(prev => [...prev, category]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await db.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await db.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const saveExchangeRates = async (rates: ExchangeRate) => {
    try {
      await db.saveExchangeRates(rates);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error saving exchange rates:', error);
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      await db.clearAllData();
      setTransactions([]);
      setCategories([]);
      setSettings(null);
      setExchangeRates(null);
      await initializeDefaultData();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  return {
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
    clearAllData,
    refreshData: loadData
  };
}