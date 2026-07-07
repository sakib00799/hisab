"use client";

import posthog from "posthog-js";

/** Capture a product event; no-op when PostHog is not configured. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
