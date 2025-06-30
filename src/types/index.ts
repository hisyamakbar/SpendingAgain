export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  currency: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: string;
}

export interface Settings {
  id: string;
  defaultCurrency: string;
  aiApiKey: string;
  aiEndpoint: string;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface AIAction {
  action: string;
  payload: any;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}