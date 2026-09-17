import Link from "next/link";
import { formatAmount } from "@/lib/shared";
import { Card, CardContent } from "@/components/ui/card";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import { resolveAccountIcon } from "@/lib/account-icons";
import { resolveAccountColor } from "@/lib/account-colors";
import type { AccountWithBalance } from "@/lib/types";

export function AccountCard({ account }: { account: AccountWithBalance }) {
  const Icon = resolveAccountIcon(account);
  const colorHex = resolveAccountColor(account);
  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="transition-colors" style={{ borderColor: `${colorHex}66` }}>
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colorHex}26`, color: colorHex }}
          >
            {/* resolveAccountIcon only ever picks from a fixed, stateless set of lucide
                icon components, so a different pick between renders is safe to swap in place. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-neutral-900">{account.name}</p>
            <p className="text-xs text-neutral-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
          </div>
          <p className="text-lg font-bold tabular-nums">{formatAmount(account.balance, account.currency, account.type)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
