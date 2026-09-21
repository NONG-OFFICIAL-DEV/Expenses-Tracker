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
  interface Navigator {
    // iOS-only flag for "launched from an Add to Home Screen icon".
    standalone?: boolean;
  }
}

// contentSafeAreaInset (Bot API 8.0+) is the value Telegram itself computes
// for exactly this: how much of the top is covered by ITS OWN chrome right
// now. When Telegram shows a real docked title bar the content area already
// starts below it, so contentSafeAreaInset.top is legitimately 0 - trust
// that. safeAreaInset (the device notch alone) is NOT a substitute: adding
// it plus a guessed "chrome row" double-counts space Telegram's native
// layout already accounted for, which caused an oversized gap in that mode.
//
// Clients too old to support contentSafeAreaInset at all (property is
// undefined, not just 0) are usually the ones showing Telegram's compact
// floating close/menu pills *over* the content instead of a docked title
// bar - there's no signal to tell us the real inset, so assume the worst
// case (floating overlay) rather than under-padding into an overlap.
const FALLBACK_HEADER_OFFSET_PX = 96;

let readyCalled = false;

function isRealTelegramClient(webApp: TelegramWebApp) {
  return Boolean(webApp.initData) || (Boolean(webApp.platform) && webApp.platform !== "unknown");
}

// A Mini App launched from its "Add to Home Screen" icon runs standalone,
// outside any chat - there's no chat header context for Telegram to dock a
// title bar into, so it always uses the compact floating close/menu chrome
// (never the docked title bar). At least on some clients this launch mode
// doesn't populate contentSafeAreaInset correctly (reports 0 even though the
// overlay is genuinely there), so trusting a reported 0 the way we do for a
// normal in-chat launch isn't safe here - force the fallback instead.
function isStandaloneLaunch() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
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

  const reported = webApp.contentSafeAreaInset ? webApp.contentSafeAreaInset.top : FALLBACK_HEADER_OFFSET_PX;
  const offset = isStandaloneLaunch() ? Math.max(reported, FALLBACK_HEADER_OFFSET_PX) : reported;

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
