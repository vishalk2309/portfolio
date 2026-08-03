-- ============================================================
-- Production reliability: dedupe purchases by Razorpay payment id.
-- Both the browser (verify-payment) and the Razorpay webhook may try to
-- record the same payment — this unique index lets us "insert, ignore if it
-- already exists" so there's exactly one purchase row per payment.
-- Run in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

create unique index if not exists purchases_payment_id_key
  on purchases (razorpay_payment_id);
-- (Postgres allows multiple NULLs in a unique index, so older/manual rows
--  without a payment id are unaffected.)
