import { useMemo } from 'react';
import { useAppState } from '../context/AppContext';

const FALLBACK_BASELINE = 100;
const SAMPLE_SIZE = 5;

/**
 * Computes a recommended-price baseline from the median reward of the most
 * recent {SAMPLE_SIZE} verified tasks. Falls back to {FALLBACK_BASELINE} when
 * there aren't enough verified tasks yet.
 *
 * Used by the custom store-item creator to suggest tier-based prices.
 */
export function useTaskRewardBaseline(): { baseline: number; sampleCount: number } {
  const { tasks } = useAppState();
  return useMemo(() => {
    const verifiedRewards = tasks
      .filter((t) => t.status === 'verified')
      .sort(
        (a, b) =>
          new Date(b.verifiedAt ?? b.createdAt).getTime() -
          new Date(a.verifiedAt ?? a.createdAt).getTime()
      )
      .slice(0, SAMPLE_SIZE)
      .map((t) => t.reward);

    if (verifiedRewards.length === 0) {
      return { baseline: FALLBACK_BASELINE, sampleCount: 0 };
    }
    const sorted = [...verifiedRewards].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const baseline =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
        : sorted[mid];
    return { baseline, sampleCount: verifiedRewards.length };
  }, [tasks]);
}

export const PRICE_TIERS = [
  { id: 'small', label: '🍬 小确幸', emoji: '🍬', multiplier: 0.5, hint: '触手可及' },
  { id: 'normal', label: '⭐ 一般奖励', emoji: '⭐', multiplier: 1.5, hint: '一两次任务可换' },
  { id: 'premium', label: '💎 特权', emoji: '💎', multiplier: 5, hint: '攒一周' },
  { id: 'jackpot', label: '👑 王炸大奖', emoji: '👑', multiplier: 15, hint: '长期目标' },
] as const;

export type PriceTierId = typeof PRICE_TIERS[number]['id'];

export function priceForTier(baseline: number, tierId: PriceTierId): number {
  const tier = PRICE_TIERS.find((t) => t.id === tierId)!;
  // Round to nearest 5 for clean numbers
  const raw = baseline * tier.multiplier;
  return Math.max(5, Math.round(raw / 5) * 5);
}
