# Launch Posts

Copy-paste ready. Ganti `@yourhandle` pake handle kamu. Post di X dulu, terus Reddit, terus HN.

---

## X (Twitter) — main post

> Library baru: `next-midtrans` — Midtrans integration typed untuk Next.js App Router 🇮🇩
>
> Sudah gak sabar tiap project buat fetch manual + webhook `any`-typed yang buggy. Sekarang:
> ✅ Snap transaction — full autocomplete
> ✅ Webhook `handleWebhook()` — verify signature SHA-512 built-in, kenapa aman? pake `timingSafeEqual`
> ✅ Server Actions + Route Handlers native
> ✅ Zero dependencies, ESM-only
>
> [github.com/naelrudd/next-midtrans](https://github.com/naelrudd/next-midtrans)

## X (Twitter) — dev tip thread (hari berikutnya)

> Webhook Midtrans kamu diautentikasi bener gak?
>
> Signature = `SHA512(orderId + statusCode + grossAmount + serverKey)`
>
> Banyak tutorial pake `===` — timing attack risk. Pakai `crypto.timingSafeEqual`:
> `next-midtrans` udah handle itu → `handleWebhook()` verify otomatis.
>
> Satu baris, gak perlu pikir lagi.

## Reddit — r/indonesia

> **Buat dev Indonesia yang pake Midtrans + Next.js — aku bikin library biar gak ngulang boilerplate**
>
> Beberapa bulan terakhir aku bikin marketplace pake Midtrans dan frustrasi banget:
> - SDK resmi gak update, `any` di mana-mana
> - Webhook verification copy-paste dari docs, rawan salah
> - App Router (Next.js 14) gak didukung
>
> Jadi aku bikin `next-midtrans`:
>
> - **Fully typed** Snap, Core API (charge/status/refund/cancel), dan webhook notification
> - **`handleWebhook()`** — verify signature SHA-512 + typed callback, kompatibel App Router
> - **Server Actions first** — bikin token langsung di server action
> - **Zero deps**, ESM-only, tree-shakeable
>
> [github.com/naelrudd/next-midtrans](https://github.com/naelrudd/next-midtrans)
>
> Contoh app App Router include. Feedback/PR welcome!

## Reddit — r/nextjs

> **next-midtrans: typo Midtrans integration untuk Next.js App Router with zero deps**
>
> Midtrans is the main payment gateway in Indonesia. Its official SDK is unmaintained, untyped, and Pages Router era. Every Indonesian Next.js dev I know copy-pastes the same webhook verification bug.
>
> Features:
> - Typed Snap createTransaction, Core API, webhook notifications
> - `handleWebhook()` auto-verifies SHA-512 signature (timingSafeEqual), returns typed notification
> - Works in Server Actions + Route Handlers, App Router native
> - Zero runtime dependencies, ESM-only
>
> Try it: [github.com/naelrudd/next-midtrans](https://github.com/naelrudd/next-midtrans)

## Hacker News — Show HN

> **Show HN: next-midtrans — typed Midtrans payments for Next.js, zero deps**
>
> Midtrans is Indonesia's dominant payment gateway (Cards, VA, QRIS, GoPay, ShopeePay, e-wallets). Their official SDK is unmaintained and untyped, so every Next.js developer in Indonesia re-implements the same webhook signature verification + `any`-typed JSON parsing.
>
> I built a typed, zero-dependency library for the App Router:
>
> - Typed Snap transaction creation + Core API (charge, status, cancel, refund, approve, deny)
> - `handleWebhook()` — parses payload, verifies the SHA-512 `x-signature-key` using `timingSafeEqual`, hands you a fully typed `TransactionNotification`
> - Designed around Server Actions and Route Handlers, no `"use server"` weirdness
> - Tree-shakeable ESM, no runtime deps
>
> Includes a runnable App Router example app pointed at Midtrans sandbox.
>
> [github.com/naelrudd/next-midtrans](https://github.com/naelrudd/next-midtrans)
>
> Feedback welcome, especially from others building payments on emerging-market gateways.

---

## Checklist launch

- [ ] Push final commit
- [ ] Publish npm (login dulu: `npm login`)
- [ ] GIF demo di README (`npm run demo:gif`)
- [ ] Star sendiri repo (biar early signal)
- [ ] Post X main thread
- [ ] 30 menit setelah: Reddit r/indonesia + r/nextjs
- [ ] 1 jam setelah: Show HN (jam 7 pagi WIB = prime time HN)
- [ ] Reply setiap komentar — engagement = ranking