"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: SnapPayOptions) => void;
      embed: (token: string, options?: SnapEmbedOptions) => void;
    };
  }
}

export interface SnapPayOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export interface SnapEmbedOptions {
  embedId: string;
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

export interface SnapResult {
  status_code: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  signature_key?: string;
  channel_response_message?: string;
  channel_response_code?: string;
}

const SNAP_SCRIPT_URL = {
  sandbox: "https://app.sandbox.midtrans.com/snap/snap.js",
  production: "https://app.midtrans.com/snap/snap.js",
} as const;

function getSnapScriptUrl(clientKey: string, isProduction: boolean): string {
  const url = new URL(isProduction ? SNAP_SCRIPT_URL.production : SNAP_SCRIPT_URL.sandbox);
  url.searchParams.set("clientKey", clientKey);
  return url.toString();
}

let scriptPromise: Promise<void> | null = null;

function loadSnapScript(url: string): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;

    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };

    const onLoad = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to load Midtrans Snap script"));
    };

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export interface UseSnapResult {
  snap: Window["snap"] | null;
  loading: boolean;
  error: Error | null;
  pay: (token: string, options?: SnapPayOptions) => void;
  embed: (token: string, options?: SnapEmbedOptions) => void;
}

export function useSnap(clientKey: string, isProduction = false): UseSnapResult {
  const [snap, setSnap] = useState<Window["snap"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!clientKey) {
      setLoading(false);
      setError(new Error("Snap clientKey is required"));
      return;
    }

    let cancelled = false;

    loadSnapScript(getSnapScriptUrl(clientKey, isProduction))
      .then(() => {
        if (cancelled) return;
        setSnap(window.snap ?? null);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientKey, isProduction]);

  const snapRef = useRef(snap);
  snapRef.current = snap;

  const pay = (token: string, options?: SnapPayOptions) => {
    if (!snapRef.current) {
      throw new Error("Snap not loaded yet");
    }
    snapRef.current.pay(token, options);
  };

  const embed = (token: string, options?: SnapEmbedOptions) => {
    if (!snapRef.current) {
      throw new Error("Snap not loaded yet");
    }
    snapRef.current.embed(token, options);
  };

  return { snap, loading, error, pay, embed };
}

export default useSnap;