import type { Transaction } from "@/lib/types";

export interface TransactionDateGroup {
  key: string;
  label: string;
  items: Transaction[];
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatGroupLabel(d: Date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (dateKey(d) === dateKey(now)) return "Today";
  if (dateKey(d) === dateKey(yesterday)) return "Yesterday";

  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function groupTransactionsByDate(transactions: Transaction[]): TransactionDateGroup[] {
  const groups: TransactionDateGroup[] = [];
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = dateKey(d);
    const current = groups[groups.length - 1];
    if (!current || current.key !== key) {
      groups.push({ key, label: formatGroupLabel(d), items: [tx] });
    } else {
      current.items.push(tx);
    }
  }
  return groups;
}
