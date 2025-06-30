import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionList({ transactions, onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  }, [transactions, searchTerm, filterType, sortBy]);

  if (transactions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Search size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-2">No Transactions Yet</h2>
          <p className="text-gray-400">Start tracking your finances by adding your first transaction!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--surface)] border border-gray-600 rounded-lg input-focus"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 bg-[var(--surface)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 bg-[var(--surface)] border border-gray-600 rounded-lg px-3 py-2 input-focus"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {filteredAndSortedTransactions.map(transaction => (
          <div key={transaction.id} className="transaction-item bg-[var(--surface)] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{transaction.description}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'income' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {transaction.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{transaction.category}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-lg font-bold ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditTransaction(transaction)}
                    className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="p-2 text-gray-400 hover:text-[var(--error)] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedTransactions.length === 0 && (
        <div className="text-center py-8">
          <Filter size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No transactions match your search criteria.</p>
        </div>
      )}
    </div>
  );
}