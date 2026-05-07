// ===========================================================================
//   lifecycle-cron — LoveOS 关系生命周期定时巡检
// ===========================================================================
//   Triggers (定时由 GitHub Actions / cron-job.org / Supabase pg_cron 调用):
//     1. 超时奏折 → auto_approved
//        approvals.expires_at < now AND status = 'pending'
//        含义：陛下三日未朱批，臣自行恭谢圣恩。不扣铜钱（免单恩典）。
//
//     2. 超时旨意 → expired
//        tasks.expires_at < now AND status = 'open'
//        含义：旨意无人接领，自动作废。
//
//     3. 过期分手 → 数据清除
//        couples.dissolution_grace_period_ends_at < now AND dissolved_at IS NOT NULL
//        含义：宽限期已满（默认 180 天），删除该 couple 全部业务数据。
//        保留 auth.users（用户账号本身不删）。
//
//   Auth: 需 header `x-cron-secret: <CRON_SECRET>` 才放行，避免被随意调用。
//
//   Returns: { processed: { autoApproved, expiredTasks, dissolvedCouples }, durationMs }
// ===========================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// 业务表清单 — couple_id 关联，dissolved 时全清
const COUPLE_OWNED_TABLES = [
  'approvals',
  'tasks',
  'store_items',
  'vouchers',
  'ledger_entries',
  'wishlist_items',
  'push_subscriptions',
  'couple_state',
] as const

interface ProcessSummary {
  autoApproved: number
  expiredTasks: number
  dissolvedCouples: number
  errors: string[]
}

// ─── (1) 超时奏折 → auto_approved ─────────────────────────────────────────────

async function autoApproveExpired(now: string, summary: ProcessSummary) {
  const { data: expired, error: queryErr } = await admin
    .from('approvals')
    .select('id, couple_id, title')
    .eq('status', 'pending')
    .lt('expires_at', now)
    .not('expires_at', 'is', null)

  if (queryErr) {
    summary.errors.push(`autoApproveExpired query: ${queryErr.message}`)
    return
  }
  if (!expired?.length) return

  const ids = expired.map(a => a.id)
  const { error: updErr } = await admin
    .from('approvals')
    .update({ status: 'auto_approved', resolved_at: now })
    .in('id', ids)

  if (updErr) {
    summary.errors.push(`autoApproveExpired update: ${updErr.message}`)
    return
  }

  // 写 ledger 记录"恭谢圣恩"事件（amount = 0，仅作流水）
  const ledgerRows = expired.map(a => ({
    id: `ledger_auto_${a.id}`,
    couple_id: a.couple_id,
    type: 'approval_deduct' as const,
    amount: 0,
    description: `自行恭谢圣恩：${a.title}`,
    timestamp: now,
    related_id: a.id,
  }))
  const { error: ledgerErr } = await admin.from('ledger_entries').upsert(ledgerRows)
  if (ledgerErr) {
    summary.errors.push(`autoApproveExpired ledger: ${ledgerErr.message}`)
  }

  summary.autoApproved = expired.length
}

// ─── (2) 超时旨意 → expired ──────────────────────────────────────────────────

async function expireOpenTasks(now: string, summary: ProcessSummary) {
  const { data: expired, error: queryErr } = await admin
    .from('tasks')
    .select('id')
    .eq('status', 'open')
    .lt('expires_at', now)
    .not('expires_at', 'is', null)

  if (queryErr) {
    summary.errors.push(`expireOpenTasks query: ${queryErr.message}`)
    return
  }
  if (!expired?.length) return

  const ids = expired.map(t => t.id)
  const { error: updErr } = await admin
    .from('tasks')
    .update({ status: 'expired' })
    .in('id', ids)

  if (updErr) {
    summary.errors.push(`expireOpenTasks update: ${updErr.message}`)
    return
  }

  summary.expiredTasks = expired.length
}

// ─── (3) 过期分手 → 数据清除 ─────────────────────────────────────────────────

async function clearDissolvedCouples(now: string, summary: ProcessSummary) {
  const { data: expired, error: queryErr } = await admin
    .from('couples')
    .select('id')
    .lt('dissolution_grace_period_ends_at', now)
    .not('dissolved_at', 'is', null)

  if (queryErr) {
    summary.errors.push(`clearDissolvedCouples query: ${queryErr.message}`)
    return
  }
  if (!expired?.length) return

  for (const couple of expired) {
    const coupleId = couple.id as string

    // 删该 couple 的所有业务数据（保留 auth.users）
    for (const table of COUPLE_OWNED_TABLES) {
      const { error } = await admin.from(table).delete().eq('couple_id', coupleId)
      if (error) {
        summary.errors.push(`delete ${table} for ${coupleId}: ${error.message}`)
      }
    }

    // 最后删 couple 本身
    const { error: coupleErr } = await admin
      .from('couples')
      .delete()
      .eq('id', coupleId)
    if (coupleErr) {
      summary.errors.push(`delete couple ${coupleId}: ${coupleErr.message}`)
    } else {
      summary.dissolvedCouples += 1
    }
  }
}

// ─── HTTP handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight（cron 通常不需要，但保留兼容）
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-cron-secret, content-type',
      },
    })
  }

  // 鉴权：必须带 x-cron-secret
  if (CRON_SECRET) {
    const provided = req.headers.get('x-cron-secret') ?? ''
    if (provided !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }
  }

  const startedAt = Date.now()
  const now = new Date().toISOString()
  const summary: ProcessSummary = {
    autoApproved: 0,
    expiredTasks: 0,
    dissolvedCouples: 0,
    errors: [],
  }

  await autoApproveExpired(now, summary)
  await expireOpenTasks(now, summary)
  await clearDissolvedCouples(now, summary)

  const durationMs = Date.now() - startedAt

  return new Response(
    JSON.stringify({ ok: summary.errors.length === 0, processed: summary, durationMs, ranAt: now }, null, 2),
    {
      status: summary.errors.length === 0 ? 200 : 207,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
})
