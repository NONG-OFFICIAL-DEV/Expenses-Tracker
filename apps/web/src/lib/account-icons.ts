import {
  Banknote,
  Bitcoin,
  Car,
  CreditCard,
  Gift,
  Heart,
  Home,
  Landmark,
  PiggyBank,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "./shared";

export const ACCOUNT_ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  wallet: Wallet,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  bitcoin: Bitcoin,
  "trending-up": TrendingUp,
  banknote: Banknote,
  "shopping-bag": ShoppingBag,
  gift: Gift,
  home: Home,
  car: Car,
  heart: Heart,
};

export const ACCOUNT_ICON_KEYS = Object.keys(ACCOUNT_ICONS);

const ACCOUNT_TYPE_DEFAULT_ICON: Record<AccountType, string> = {
  BANK: "landmark",
  SAVINGS: "piggy-bank",
  CASH: "wallet",
  MOBILE_WALLET: "smartphone",
  CRYPTO: "bitcoin",
  INVESTMENT: "trending-up",
  CREDIT_CARD: "credit-card",
  OTHER: "banknote",
};

export function resolveAccountIcon(account: { icon?: string | null; type: AccountType }): LucideIcon {
  if (account.icon && ACCOUNT_ICONS[account.icon]) return ACCOUNT_ICONS[account.icon];
  return ACCOUNT_ICONS[ACCOUNT_TYPE_DEFAULT_ICON[account.type]];
}

export function defaultAccountIcon(type: AccountType): string {
  return ACCOUNT_TYPE_DEFAULT_ICON[type];
}
