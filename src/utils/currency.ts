import { ExchangeRate } from '../types';
import { db } from './database';

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW',
  'IDR', 'MYR', 'THB', 'PHP', 'VND'
];

export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRate | null> {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    const data = await response.json();
    
    if (data.result === 'success') {
      const exchangeRate: ExchangeRate = {
        id: 'main',
        baseCurrency,
        rates: data.rates,
        lastUpdated: new Date().toISOString()
      };
      
      await db.saveExchangeRates(exchangeRate);
      return exchangeRate;
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency first, then to target currency
  const baseAmount = amount / rates[fromCurrency];
  return baseAmount * rates[toCurrency];
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}