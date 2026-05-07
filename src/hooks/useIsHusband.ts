import { useEffectiveRole } from './useEffectiveRole';

/** 当前 effective role 是否为老公（即金币持有者 / 商店买家）。 */
export function useIsHusband(): boolean {
  return useEffectiveRole() === 'husband';
}
