import { useAppState } from '../context/AppContext';
import type { UserRole } from '../types';

/**
 * Returns the user's *effective* role, accounting for 倒反天罡 mode.
 * In flip mode wife→husband and vice-versa for permission gating.
 * displayName/avatar/identity are NOT affected — that's still the real user.
 */
export function useEffectiveRole(): UserRole | null {
  const { currentUser, flipMode } = useAppState();
  if (!currentUser) return null;
  if (!flipMode) return currentUser;
  return currentUser === 'wife' ? 'husband' : 'wife';
}

/** True when the effective role is the approver / task-publisher (i.e. wife in normal flow). */
export function useIsApprover(): boolean {
  return useEffectiveRole() === 'wife';
}
