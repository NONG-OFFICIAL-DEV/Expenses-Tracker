export const ACCOUNT_TYPES = [
  "BANK",
  "SAVINGS",
  "CASH",
  "MOBILE_WALLET",
  "CRYPTO",
  "INVESTMENT",
  "CREDIT_CARD",
  "OTHER",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const CATEGORY_KINDS = ["INCOME", "EXPENSE"] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];
