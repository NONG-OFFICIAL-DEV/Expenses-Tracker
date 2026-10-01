"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

interface PreviewRow {
  id: string;
  label: string;
  oldDate: string;
  newDate: string;
}

// TEMPORARY: one-time tool to correct transactions saved before the
// date-timezone bug was patched (see transactions.service.ts's
// previewDateBackfill/applyDateBackfill). Remove this component and its
// entry point in transactions/page.tsx once run.
export function FixDatesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PreviewRow[]>("/transactions/backfill-preview?offsetHours=7");
      setRows(data);
    } catch {
      setError("Couldn't load the preview. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ updated: number }>("/transactions/backfill-apply?offsetHours=7");
      setApplied(res.updated);
      setRows(null);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch {
      setError("Couldn't apply the fix. Nothing was changed - try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setRows(null);
          setApplied(null);
          setError(null);
        }
      }}
    >
      <DialogContent title="Fix historical transaction dates">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-500">
            One-time fix for transactions saved before a timezone bug was patched. It re-derives each transaction&apos;s
            correct calendar day assuming Cambodia (UTC+7) and corrects it. Preview first, then apply.
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {applied !== null ? (
            <p className="text-sm font-medium text-emerald-600">
              Done — corrected {applied} transaction{applied === 1 ? "" : "s"}.
            </p>
          ) : rows === null ? (
            <Button onClick={loadPreview} disabled={loading}>
              {loading ? "Checking..." : "Preview affected transactions"}
            </Button>
          ) : rows.length === 0 ? (
            <p className="text-sm text-neutral-500">No transactions need correcting.</p>
          ) : (
            <>
              <div className="no-scrollbar flex max-h-64 flex-col gap-1 overflow-y-auto">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-2 border-b border-neutral-100 py-1.5 text-sm"
                  >
                    <span className="truncate">{row.label}</span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {new Date(row.oldDate).toLocaleDateString()} → {new Date(row.newDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              <Button onClick={apply} disabled={loading}>
                {loading ? "Applying..." : `Apply fix to ${rows.length} transaction${rows.length === 1 ? "" : "s"}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
