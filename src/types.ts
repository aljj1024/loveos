// ─── User / Auth ──────────────────────────────────────────

export type UserRole = 'wife' | 'husband';

// ─── Approval / OA ───────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'conditional';
export type ApprovalTemplate = 'basketball' | 'shopping' | 'truce' | 'custom';

export interface Approval {
  id: string;
  template: ApprovalTemplate;
  title: string;
  reason: string;
  datetime: string;
  sincerity: string;
  submittedAt: string;
  submittedBy?: UserRole;
  status: ApprovalStatus;
  resolvedAt?: string;
  conditionText?: string;
  conditionTaskId?: string;
  pointsDeducted?: number;
}

// ─── Task / Economy ──────────────────────────────────────

export type TaskStatus = 'open' | 'accepted' | 'pending_verify' | 'verified' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  icon: string;
  reward: number;
  createdBy: 'husband' | 'wife';
  acceptedBy?: 'husband' | 'wife';
  status: TaskStatus;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  sourceApprovalId?: string;
}

// ─── Store / Marketplace ─────────────────────────────────

export interface StoreItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  colorClass: string;
  isCustom: boolean;
  createdBy?: 'husband' | 'wife';
}

export interface Voucher {
  id: string;
  itemId: string;
  itemTitle: string;
  itemIcon: string;
  purchasedAt: string;
  purchasedBy?: UserRole;
  isRedeemed: boolean;
  pendingRedemption: boolean;
  confirmedBy?: UserRole;
  confirmedAt?: string;
}

// ─── Points Ledger ───────────────────────────────────────

export type LedgerEntryType =
  | 'task_reward'
  | 'approval_deduct'
  | 'store_purchase'
  | 'manual_add'
  | 'manual_deduct';

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amount: number;
  description: string;
  timestamp: string;
  relatedId?: string;
}

// ─── Wiki / Shared Brain ─────────────────────────────────

export interface ProfileField {
  key: string;
  label: string;
  value: string;
  colSpan?: 1 | 2;
  highlight?: boolean;
}

export interface WikiProfile {
  id: 'wife' | 'husband';
  displayName: string;
  avatar: string;
  fields: ProfileField[];
}

export interface WishlistItem {
  id: string;
  name: string;
  emoji: string;
  notes?: string;
  addedAt: string;
  addedBy?: UserRole;
  claimedBy?: UserRole;
  claimedAt?: string;
}

// ─── Mood ─────────────────────────────────────────────────

export interface Mood {
  id: string;
  icon: string;
  text: string;
  colorClass: string;
}

export interface MoodState {
  current: Mood;
  setAt: string;
}

// ─── App Navigation ───────────────────────────────────────

export type TabId = 'home' | 'economy' | 'wiki' | 'profile';

export type OverlayId =
  | 'form'
  | 'approval'
  | 'conditional'
  | 'taskCreate'
  | 'storeItemCreate'
  | 'voucher'
  | 'wikiEdit'
  | 'stats'
  | 'approvalHistory'
  | null;
