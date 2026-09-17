import Link from "next/link";
import { formatAmount } from "@/lib/shared";
import { Card, CardContent } from "@/components/ui/card";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import type { AccountWithBalance } from "@/lib/types";

export function AccountCard({ account }: { account: AccountWithBalance }) {
  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="transition-colors hover:border-neutral-300">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-neutral-900">{account.name}</p>
            <p className="text-xs text-neutral-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
          <p className="text-lg font-bold tabular-nums">{formatAmount(account.balance, account.currency, account.type)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
