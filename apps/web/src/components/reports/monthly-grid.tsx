import { formatAmount } from "@/lib/shared";
import type { MonthlyReport } from "@/lib/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyGrid({ report, currency }: { report: MonthlyReport; currency: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="sticky left-0 bg-neutral-50 px-3 py-2 text-left font-medium text-neutral-500">Category</th>
            {MONTH_LABELS.map((m) => (
              <th key={m} className="px-3 py-2 text-right font-medium text-neutral-500 [font-variant-numeric:tabular-nums]">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.categories.map((row) => (
            <tr key={row.categoryId} className="border-b border-neutral-100 last:border-0">
              <td className="sticky left-0 bg-white px-3 py-2 font-medium text-neutral-900">{row.name}</td>
              {row.months.map((value, index) => (
                <td key={index} className="px-3 py-2 text-right text-neutral-700 [font-variant-numeric:tabular-nums]">
                  {value === 0 ? "-" : formatAmount(value, currency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold">
            <td className="sticky left-0 bg-neutral-50 px-3 py-2">Total</td>
            {report.totalsByMonth.map((value, index) => (
              <td key={index} className="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">
                {formatAmount(value, currency)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
