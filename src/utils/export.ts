import { Transaction } from '../types';

export function exportToCSV(transactions: Transaction[]): void {
  const headers = ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Description'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      t.date,
      t.type,
      t.amount,
      t.currency,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `spendingagain-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}