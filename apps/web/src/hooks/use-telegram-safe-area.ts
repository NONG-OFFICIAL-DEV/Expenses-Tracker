"use client";

import { useEffect } from "react";

interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  safeAreaInset?: TelegramSafeAreaInset;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  // Only ever populated by a real Telegram client launching the Mini App -
  // telegram-web-app.js still defines a stub WebApp object when the script is
  // just loaded standalone in a regular browser, so this is what actually
  // tells the two situations apart.
  initData?: string;
  platform?: string;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

// Telegram's own close/menu chrome floats over the top of the page and isn't
// covered by env(safe-area-inset-top) (that's only the device notch/status
// bar). Bot API 8.0+ exposes contentSafeAreaInset/safeAreaInset for exactly
// this; older clients that don't expose either get this conservative fallback
// so the header still clears Telegram's overlay controls.
const FALLBACK_HEADER_OFFSET_PX = 56;

let readyCalled = false;

function isRealTelegramClient(webApp: TelegramWebApp) {
  return Boolean(webApp.initData) || (Boolean(webApp.platform) && webApp.platform !== "unknown");
}

/** Reads Telegram's safe area (if available) and sets --tg-header-offset on <html>. Safe to call repeatedly. No-op outside a real Telegram client, so the plain website is never affected. */
export function applyTelegramSafeArea() {
  const webApp = window.Telegram?.WebApp;
  if (!webApp || !isRealTelegramClient(webApp)) return;

  if (!readyCalled) {
    readyCalled = true;
    webApp.ready();
    webApp.expand();
  }

  const top = webApp.contentSafeAreaInset?.top ?? webApp.safeAreaInset?.top ?? 0;
  const offset = top > 0 ? top : FALLBACK_HEADER_OFFSET_PX;
  document.documentElement.style.setProperty("--tg-header-offset", `${offset}px`);
}

/**
 * Keeps --tg-header-offset in sync with Telegram's chrome. The telegram-web-app.js
 * script loads asynchronously (see root layout's onLoad), so this also re-checks on
 * mount to cover client-side navigations after the script has already loaded.
 */
export function useTelegramSafeArea() {
  useEffect(() => {
    applyTelegramSafeArea();

    const webApp = window.Telegram?.WebApp;
    if (!webApp || !isRealTelegramClient(webApp)) return;

    webApp.onEvent("contentSafeAreaChanged", applyTelegramSafeArea);
    webApp.onEvent("safeAreaChanged", applyTelegramSafeArea);
    webApp.onEvent("viewportChanged", applyTelegramSafeArea);

    return () => {
      webApp.offEvent("contentSafeAreaChanged", applyTelegramSafeArea);
      webApp.offEvent("safeAreaChanged", applyTelegramSafeArea);
      webApp.offEvent("viewportChanged", applyTelegramSafeArea);
    };
  }, []);
}
