"use client";

import { useEffect, useState } from "react";
import { getTelegramDiagnostics } from "@/hooks/use-telegram-safe-area";

/**
 * TEMPORARY diagnostic overlay - shows exactly what window.Telegram.WebApp is
 * reporting on this specific device/launch mode, so a bug report screenshot
 * carries real data instead of us guessing at Telegram's behavior. Only
 * renders inside a real Telegram client; remove once the "Add to Home
 * Screen" safe-area issue is confirmed fixed for good.
 */
export function TelegramDebugBadge() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof getTelegramDiagnostics> | null>(null);

  useEffect(() => {
    function refresh() {
      const data = getTelegramDiagnostics();
      if (data.isRealClient) setSnapshot(data);
    }

    refresh();
    const interval = setInterval(refresh, 1000);

    const webApp = window.Telegram?.WebApp;
    webApp?.onEvent?.("contentSafeAreaChanged", refresh);
    webApp?.onEvent?.("safeAreaChanged", refresh);
    webApp?.onEvent?.("viewportChanged", refresh);

    return () => {
      clearInterval(interval);
      webApp?.offEvent?.("contentSafeAreaChanged", refresh);
      webApp?.offEvent?.("safeAreaChanged", refresh);
      webApp?.offEvent?.("viewportChanged", refresh);
    };
  }, []);

  if (!snapshot) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-2 z-[100] max-w-[calc(100vw-1rem)] rounded-lg bg-black/85 p-2 font-mono text-[10px] leading-tight text-lime-300 shadow-lg">
      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(snapshot, null, 1)}</pre>
    </div>
  );
}
