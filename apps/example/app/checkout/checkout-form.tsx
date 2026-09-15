"use client";

import { useState } from "react";
import { useSnap } from "next-midtrans/react";
import type { SnapResult } from "next-midtrans/react";
import { createSnapToken } from "./actions";

export default function Checkout() {
  const [amount, setAmount] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnapResult | null>(null);

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  const { pay, loading: snapLoading, error: snapError } = useSnap(clientKey, isProduction);

  async function handlePayment() {
    setLoading(true);
    try {
      const orderId = "ORDER-" + Date.now();
      const token = await createSnapToken(orderId, amount);
      pay(token, {
        onSuccess: (r) => setResult(r),
        onPending: (r) => setResult(r),
        onError: (r) => setResult(r),
        onClose: () => setResult(null),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <label htmlFor="amount">Amount (IDR)</label>
      <input
        id="amount"
        type="number"
        min={10000}
        step={1000}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <button onClick={handlePayment} disabled={loading || snapLoading}>
        {loading ? "Creating transaction..." : snapLoading ? "Loading Snap..." : "Pay with Snap"}
      </button>

      {snapError && <p style={{ color: "#dc2626" }}>{snapError.message}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}