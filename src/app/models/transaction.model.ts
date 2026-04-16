export interface Transaction {
  id?: number;
  type: 'Income' | 'Expense';
  amount: number;
  date: number;                    // Unix timestamp (seconds or ms - we'll use ms)
  description: string;
  category: 'Sales' | 'Marketing' | 'Salary' | 'Utility' | 'Logistic' | 'Purchase';
}