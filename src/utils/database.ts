import { Transaction, Category, Settings, ExchangeRate } from '../types';

const DB_NAME = 'SpendingAgainDB';
const DB_VERSION = 1;

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('date', 'date');
          transactionStore.createIndex('type', 'type');
          transactionStore.createIndex('category', 'category');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('type', 'type');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Exchange rates store
        if (!db.objectStoreNames.contains('exchange_rates')) {
          db.createObjectStore('exchange_rates', { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureConnection(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Transactions
  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      await store.add(transaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      await store.put(transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      await store.delete(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['transactions'], 'readonly');
      const store = tx.objectStore('transactions');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Categories
  async addCategory(category: Category): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['categories'], 'readwrite');
      const store = tx.objectStore('categories');
      await store.add(category);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['categories'], 'readonly');
      const store = tx.objectStore('categories');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['categories'], 'readwrite');
      const store = tx.objectStore('categories');
      await store.delete(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Settings
  async getSettings(): Promise<Settings | null> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('main');
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['settings'], 'readwrite');
      const store = tx.objectStore('settings');
      await store.put(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Exchange Rates
  async getExchangeRates(): Promise<ExchangeRate | null> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['exchange_rates'], 'readonly');
      const store = tx.objectStore('exchange_rates');
      const request = store.get('main');
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting exchange rates:', error);
      return null;
    }
  }

  async saveExchangeRates(rates: ExchangeRate): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['exchange_rates'], 'readwrite');
      const store = tx.objectStore('exchange_rates');
      await store.put(rates);
    } catch (error) {
      console.error('Error saving exchange rates:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = await this.ensureConnection();
      const tx = db.transaction(['transactions', 'categories', 'settings', 'exchange_rates'], 'readwrite');
      
      await Promise.all([
        tx.objectStore('transactions').clear(),
        tx.objectStore('categories').clear(),
        tx.objectStore('settings').clear(),
        tx.objectStore('exchange_rates').clear()
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const db = new DatabaseManager();