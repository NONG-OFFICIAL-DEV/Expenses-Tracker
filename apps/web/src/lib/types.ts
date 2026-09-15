import type { AccountType, TransactionType, CategoryKind } from "@expense-tracker/shared";

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountWithBalance extends Account {
  balance: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  kind: CategoryKind;
  parentId: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: TransactionType;
  amount: string;
  date: string;
  merchant: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  account: Account;
  toAccount: Account | null;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BalanceAdjustment {
  id: string;
  accountId: string;
  calculatedBalance: string;
  actualBalance: string;
  difference: string;
  note: string | null;
  createdAt: string;
}

export interface CategoryBreakdownEntry {
  categoryId: string;
  name: string;
  total: number;
}

export interface DashboardSummary {
  year: number;
  month: number;
  income: number;
  expenses: number;
  net: number;
  savings: number;
  totalBalance: number;
  categoryBreakdown: CategoryBreakdownEntry[];
  previousMonth: {
    year: number;
    month: number;
    income: number;
    expenses: number;
    net: number;
  };
}

export interface MonthlyReportRow {
  categoryId: string;
  name: string;
  months: number[];
}

export interface MonthlyReport {
  year: number;
  categories: MonthlyReportRow[];
  totalsByMonth: number[];
}
