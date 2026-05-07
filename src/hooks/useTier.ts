// ===========================================================================
//   useTier — 头衔系统（戏精政务双轨段位）
// ===========================================================================
//   方案 A 派生计算（plan 已锁定）：不加任何新字段，全靠现有数据派生。
//
//     老公轴（铜钱累计）：ledger_entries 中 type='task_reward' 的 amount 累计求和
//                         （历史总入帐，不是当前余额）
//     老婆轴（准奏次数）：approvals 中 status='approved' 且 submitted_by != wife
//                         的 row count（历史朱批通过次数；
//                         auto_approved 不算——那是被动恭谢圣恩，不是主动朱批）
//
//   倒反天罡时段位互换显示（复用 useEffectiveRole）。
// ===========================================================================

import { useMemo } from 'react'
import { useAppState } from '../context/AppContext'
import { useEffectiveRole } from './useEffectiveRole'

export interface Tier {
  /** 段位名 */
  name: string
  /** 段位等级 0..N（包衣=0、校尉=1...） */
  level: number
  /** 当前累计值（铜钱总入帐 / 准奏次数）*/
  current: number
  /** 下一阶门槛；已是顶级时为 null */
  nextThreshold: number | null
  /** 距离下一阶还差多少；已是顶级时为 null */
  toNext: number | null
  /** 进度百分比 0..1（用于展示进度条）*/
  progress: number
  /** 在朝廷里属哪个轴 */
  axis: 'husband' | 'wife'
}

// ─── 阈值表（从大到小排，便于命中查找） ─────────────────────────────────────

const HUSBAND_TIERS: { name: string; threshold: number }[] = [
  { name: '太上皇', threshold: 50000 },
  { name: '摄政王', threshold: 20000 },
  { name: '亲王', threshold: 8000 },
  { name: '郡王', threshold: 3000 },
  { name: '贝勒', threshold: 1000 },
  { name: '校尉', threshold: 200 },
  { name: '包衣', threshold: 0 },
]

const WIFE_TIERS: { name: string; threshold: number }[] = [
  { name: '摄政皇后', threshold: 600 },
  { name: '皇后', threshold: 250 },
  { name: '贵妃', threshold: 100 },
  { name: '妃', threshold: 40 },
  { name: '嫔', threshold: 15 },
  { name: '贵人', threshold: 5 },
  { name: '才人', threshold: 0 },
]

// ─── 段位计算辅助 ────────────────────────────────────────────────────────────

function computeTier(
  current: number,
  table: { name: string; threshold: number }[],
  axis: Tier['axis'],
): Tier {
  // table 从大到小，第一个 threshold <= current 的就是当前段位
  const matched = table.findIndex(t => current >= t.threshold)
  const tier = table[matched]
  // level = 倒序索引（包衣=0、校尉=1 ...）
  const level = table.length - 1 - matched
  // 下一阶 = matched-1（更高）
  const next = matched > 0 ? table[matched - 1] : null

  let progress = 1 // 顶级默认满
  if (next) {
    const span = next.threshold - tier.threshold
    progress = span > 0 ? Math.min(1, (current - tier.threshold) / span) : 0
  }

  return {
    name: tier.name,
    level,
    current,
    nextThreshold: next?.threshold ?? null,
    toNext: next ? Math.max(0, next.threshold - current) : null,
    progress,
    axis,
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** 老公段位（按铜钱累计入帐）*/
export function useHusbandTier(): Tier {
  const { ledger } = useAppState()
  const totalEarned = useMemo(
    () =>
      ledger
        .filter(e => e.type === 'task_reward')
        .reduce((sum, e) => sum + Math.max(0, e.amount), 0),
    [ledger],
  )
  return useMemo(() => computeTier(totalEarned, HUSBAND_TIERS, 'husband'), [totalEarned])
}

/** 老婆段位（按主动朱批通过次数；auto_approved 不算）*/
export function useWifeTier(): Tier {
  const { approvals } = useAppState()
  const approvedCount = useMemo(
    () =>
      approvals.filter(
        a => a.status === 'approved' && a.submittedBy !== 'wife',
      ).length,
    [approvals],
  )
  return useMemo(() => computeTier(approvedCount, WIFE_TIERS, 'wife'), [approvedCount])
}

/**
 * 当前 effective 用户的段位（倒反天罡时自动互换）。
 * effectiveRole 是 useEffectiveRole 的派生：currentUser ⊕ flipMode。
 *
 * 例：currentUser=wife、flipMode=true → effectiveRole=husband，本 hook 返回老公段位。
 */
export function useEffectiveTier(): Tier {
  const role = useEffectiveRole()
  const husbandTier = useHusbandTier()
  const wifeTier = useWifeTier()
  return role === 'husband' ? husbandTier : wifeTier
}
