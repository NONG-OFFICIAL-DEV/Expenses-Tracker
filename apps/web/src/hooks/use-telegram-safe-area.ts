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
  version?: string;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  // True when the bot's Menu Button "Launch mode" is set to Fullscreen (or
  // requestFullscreen() was called) - the app then always renders edge-to-edge
  // with Telegram's close/menu controls floating over the content, since
  // there's no docked-title-bar alternative in this mode.
  isFullscreen?: boolean;
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

export function isRealTelegramClient(webApp: TelegramWebApp) {
  return Boolean(webApp.initData) || (Boolean(webApp.platform) && webApp.platform !== "unknown");
}

// A Mini App launched from its "Add to Home Screen" icon runs standalone,
// outside any chat - there's no chat header context for Telegram to dock a
// title bar into, so it always uses the compact floating close/menu chrome
// (never the docked title bar). At least on some clients this launch mode
// doesn't populate contentSafeAreaInset correctly (reports 0 even though the
// overlay is genuinely there), so trusting a reported 0 the way we do for a
// normal in-chat launch isn't safe here - force the fallback instead.
export function isStandaloneLaunch() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

// A bot's Main App can be configured in BotFather with Launch mode =
// Fullscreen - opened this way (t.me/bot/appname, not the menu button), the
// app always renders edge-to-edge with the close/menu controls floating over
// the content, the same "no docked alternative" situation as isStandaloneLaunch,
// so it gets the same fallback-floor treatment.
export function isFullscreenLaunch(webApp: TelegramWebApp) {
  return webApp.isFullscreen === true;
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
  const forceFloor = isStandaloneLaunch() || isFullscreenLaunch(webApp);
  const offset = forceFloor ? Math.max(reported, FALLBACK_HEADER_OFFSET_PX) : reported;

  const current = document.documentElement.style.getPropertyValue("--tg-header-offset");
  const next = `${offset}px`;
  if (current !== next) {
    document.documentElement.style.setProperty("--tg-header-offset", next);
  }
}

/**
 * Keeps --tg-header-offset in sync with Telegram's chrome. AppShell (where this
 * runs) is the shared protected layout, so this effect mounts once per app
 * session, not once per page - client-side navigations never re-trigger it.
 *
 * Telegram's own chrome can change *after* that single mount (its docked title
 * bar can later collapse into the floating close/menu pills mid-session), and
 * contentSafeAreaInset updates to match - but on real devices this has been
 * observed to update the live property without reliably firing
 * contentSafeAreaChanged/viewportChanged, leaving --tg-header-offset frozen at
 * a now-stale value (confirmed via on-device diagnostics: contentSafeAreaInset
 * read live as 46 while the applied offset was still stuck at 0). The events
 * are kept for instant response when they do fire, but a poll is the actual
 * safety net - cheap (a couple of property reads, a no-op style write unless
 * the value changed) and it's the only thing that reproduced correctly on
 * device.
 */
export function useTelegramSafeArea() {
  useEffect(() => {
    applyTelegramSafeArea();

    const webApp = window.Telegram?.WebApp;
    if (!webApp || !isRealTelegramClient(webApp)) return;

    webApp.onEvent("contentSafeAreaChanged", applyTelegramSafeArea);
    webApp.onEvent("safeAreaChanged", applyTelegramSafeArea);
    webApp.onEvent("viewportChanged", applyTelegramSafeArea);
    webApp.onEvent("fullscreenChanged", applyTelegramSafeArea);

    const interval = window.setInterval(applyTelegramSafeArea, 1000);

    return () => {
      webApp.offEvent("contentSafeAreaChanged", applyTelegramSafeArea);
      webApp.offEvent("safeAreaChanged", applyTelegramSafeArea);
      webApp.offEvent("viewportChanged", applyTelegramSafeArea);
      webApp.offEvent("fullscreenChanged", applyTelegramSafeArea);
      window.clearInterval(interval);
    };
  }, []);
}
