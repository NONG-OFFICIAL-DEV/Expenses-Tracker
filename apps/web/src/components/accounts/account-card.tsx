import Link from "next/link";
import { formatAmount } from "@/lib/shared";
import { Card, CardContent } from "@/components/ui/card";
import type { AccountWithBalance } from "@/lib/types";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: "Bank",
  SAVINGS: "Savings",
  CASH: "Cash",
  MOBILE_WALLET: "Mobile wallet",
  CRYPTO: "Crypto",
  INVESTMENT: "Investment",
  CREDIT_CARD: "Credit card",
  OTHER: "Other",
};

export function AccountCard({ account }: { account: AccountWithBalance }) {
  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-neutral-900">{account.name}</p>
            <p className="text-xs text-neutral-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
          <p className="text-lg font-semibold">{formatAmount(account.balance, account.currency, account.type)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
