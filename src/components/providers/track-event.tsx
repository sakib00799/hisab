"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fire a PostHog event once when a (server-rendered) page mounts. */
export function TrackEvent({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
