"use client";

import Script from "next/script";
import { applyTelegramSafeArea } from "@/hooks/use-telegram-safe-area";

/** Loads the Telegram Mini Apps SDK without blocking hydration, then applies its safe-area insets as soon as it's ready. */
export function TelegramScript() {
  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="afterInteractive"
      onLoad={() => applyTelegramSafeArea()}
    />
  );
}
