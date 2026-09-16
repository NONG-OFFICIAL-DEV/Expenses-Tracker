import type { AccountType } from "./enums.js";

const PRECISION_BY_ACCOUNT_TYPE: Record<AccountType, number> = {
  BANK: 2,
  SAVINGS: 2,
  CASH: 2,
  CREDIT_CARD: 2,
  INVESTMENT: 2,
  MOBILE_WALLET: 4,
  CRYPTO: 8,
  OTHER: 2,
};

export function precisionForAccountType(type: AccountType): number {
  return PRECISION_BY_ACCOUNT_TYPE[type];
}

export function formatAmount(
  value: number | string,
  currency: string,
  accountType: AccountType = "BANK"
): string {
  const num = typeof value === "string" ? Number(value) : value;
  const precision = precisionForAccountType(accountType);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Math.min(precision, 2),
      maximumFractionDigits: precision,
    }).format(num);
  } catch {
    return `${num.toFixed(precision)} ${currency}`;
  }
}

export function formatPlainAmount(value: number | string, accountType: AccountType = "BANK"): string {
  const num = typeof value === "string" ? Number(value) : value;
  const precision = precisionForAccountType(accountType);
  return num.toFixed(precision);
}
