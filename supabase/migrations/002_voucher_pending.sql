-- Phase 2: Voucher pending redemption support
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS pending_redemption BOOLEAN DEFAULT FALSE;
