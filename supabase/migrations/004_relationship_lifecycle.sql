-- ===========================================================================
--   004 — Relationship lifecycle: 分手友好 + 关系阶段 + 超时兜底
-- ===========================================================================
--   This migration adds three pillars of LoveOS's product moat (per
--   MARKET_RESEARCH.md):
--     1. Dissolution-friendly data ownership (180-day grace period)
--     2. Relationship-stage extension (dating → parenting LTV path)
--     3. Approval/Task timeout fallback (so couples don't get stuck when
--        partner doesn't open the app — the silent killer of couple apps)
-- ===========================================================================

-- ─── 1. 分手友好（couples: dissolution metadata） ───────────────────────────

ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS dissolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dissolution_grace_period_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dissolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dissolution_reason TEXT;

COMMENT ON COLUMN couples.dissolved_at IS '触发分手的时刻；用于客户端判断是否进入冻结模式';
COMMENT ON COLUMN couples.dissolution_grace_period_ends_at IS '宽限期结束时刻（默认 dissolved_at + 180 days）；过期后 lifecycle-cron 会清空数据';
COMMENT ON COLUMN couples.dissolved_by IS '触发分手的一方 user_id（紧急切断按钮的发起者）';
COMMENT ON COLUMN couples.dissolution_reason IS '可选的分手原因/留言（供 onboarding 使用）';

CREATE INDEX IF NOT EXISTS couples_dissolution_grace_idx
  ON couples (dissolution_grace_period_ends_at)
  WHERE dissolved_at IS NOT NULL;

-- ─── 2. 关系阶段（couples: relationship stage + anniversary） ──────────────

ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS relationship_stage TEXT NOT NULL DEFAULT 'dating'
    CHECK (relationship_stage IN ('dating','cohabiting','married','parenting')),
  ADD COLUMN IF NOT EXISTS anniversary_date DATE;

COMMENT ON COLUMN couples.relationship_stage IS '当前关系阶段，用于 Phase 5+ 按阶段解锁功能（宝宝档案/双家长协作等）';
COMMENT ON COLUMN couples.anniversary_date IS '在一起的纪念日（dating 起点）';

-- ─── 3. 超时兜底（approvals + tasks: expires_at） ─────────────────────────

ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

COMMENT ON COLUMN approvals.expires_at IS '奏折超时时刻；过期且仍 pending 时 lifecycle-cron 会自动改 auto_approved（陛下三日未朱批，臣自行恭谢圣恩）';
COMMENT ON COLUMN tasks.expires_at IS '旨意超时时刻；过期且仍 open 时 lifecycle-cron 会自动改 expired';

-- 为 cron 扫描效率加索引（只对 pending/open 状态建 partial index）
CREATE INDEX IF NOT EXISTS approvals_expires_idx
  ON approvals (expires_at)
  WHERE status = 'pending' AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS tasks_expires_idx
  ON tasks (expires_at)
  WHERE status = 'open' AND expires_at IS NOT NULL;

-- ─── 4. 状态枚举扩展（不强制 CHECK，保持灵活） ──────────────────────────────
--   approvals.status 现有: pending | approved | rejected | conditional
--   新增: auto_approved （cron 自动通过）
--
--   tasks.status 现有: open | accepted | pending_verify | verified | cancelled
--   新增: expired （cron 自动关闭）
--
--   现有 schema 用 TEXT 不带 CHECK，所以新值无需 ALTER；client 端 enum 同步即可。

-- ─── 5. RLS 策略不变（couples / approvals / tasks 已有 policy 覆盖新字段） ──
--   get_my_couple_id() 函数沿用，新字段属于既有表，自动继承访问控制。
