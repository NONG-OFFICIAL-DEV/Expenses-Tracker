import type { AccountType } from "./shared";

// A curated palette in the spirit of common real-world bank/fintech brand colors
// (blue like Chase/PayPal, red like Bank of America/Wells Fargo, green like Cash
// App/Chime, teal like Revolut/Discover, etc.) so an account can be tinted to
// match the real bank it represents.
export const ACCOUNT_COLORS: Record<string, string> = {
  blue: "#1364FF",
  navy: "#0B2545",
  red: "#D0202A",
  rose: "#E11D48",
  amber: "#F5A524",
  green: "#16A34A",
  teal: "#0D9488",
  cyan: "#0EA5E9",
  indigo: "#4F46E5",
  purple: "#7C3AED",
  pink: "#EC4899",
  slate: "#64748B",
};

export const ACCOUNT_COLOR_KEYS = Object.keys(ACCOUNT_COLORS);

const ACCOUNT_TYPE_DEFAULT_COLOR: Record<AccountType, string> = {
  BANK: "blue",
  SAVINGS: "green",
  CASH: "slate",
  MOBILE_WALLET: "cyan",
  CRYPTO: "amber",
  INVESTMENT: "purple",
  CREDIT_CARD: "red",
  OTHER: "slate",
};

export function defaultAccountColor(type: AccountType): string {
  return ACCOUNT_TYPE_DEFAULT_COLOR[type];
}

export function resolveAccountColor(account: { color?: string | null; type: AccountType }): string {
  if (account.color && ACCOUNT_COLORS[account.color]) return ACCOUNT_COLORS[account.color];
  return ACCOUNT_COLORS[ACCOUNT_TYPE_DEFAULT_COLOR[account.type]];
}
