import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Transaction, ExchangeRate } from '../types';
import { convertCurrency, formatCurrency } from '../utils/currency';

interface DashboardProps {
  transactions: Transaction[];
  exchangeRates: ExchangeRate | null;
  defaultCurrency: string;
}

export function Dashboard({ transactions, exchangeRates, defaultCurrency }: DashboardProps) {
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.date).toISOString().slice(0, 7) === currentMonth
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    currentMonthTransactions.forEach(transaction => {
      let amount = transaction.amount;
      
      // Convert to default currency if needed
      if (transaction.currency !== defaultCurrency && exchangeRates) {
        amount = convertCurrency(
          amount,
          transaction.currency,
          defaultCurrency,
          exchangeRates.rates
        );
      }

      if (transaction.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions, exchangeRates, defaultCurrency]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <DollarSign size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">Welcome to SpendingAgain</h2>
          <p className="text-gray-400 mb-4">No transactions yet. Tap the '+' button to add your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Income</p>
              <p className="text-2xl font-bold income">
                {formatCurrency(monthlyStats.totalIncome, defaultCurrency)}
              </p>
            </div>
            <TrendingUp className="text-[var(--primary)]" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold expense">
                {formatCurrency(monthlyStats.totalExpenses, defaultCurrency)}
              </p>
            </div>
            <TrendingDown className="text-[var(--error)]" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Net Balance</p>
              <p className={`text-2xl font-bold ${monthlyStats.netBalance >= 0 ? 'income' : 'expense'}`}>
                {formatCurrency(monthlyStats.netBalance, defaultCurrency)}
              </p>
            </div>
            <DollarSign className={monthlyStats.netBalance >= 0 ? 'text-[var(--primary)]' : 'text-[var(--error)]'} size={32} />
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={24} />
          <h3 className="text-lg font-semibold">Monthly Overview</h3>
        </div>
        <div className="chart-container flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full border-8 border-[var(--primary)] border-t-[var(--error)] animate-spin" 
                 style={{ animationDuration: '3s' }}></div>
            <p className="text-sm text-gray-400">
              {monthlyStats.transactionCount} transactions this month
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item flex items-center justify-between p-3 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-400">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}