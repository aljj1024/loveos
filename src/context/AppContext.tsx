import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import type { Dispatch } from 'react';
import type {
  TabId,
  OverlayId,
  Approval,
  ApprovalStatus,
  Task,
  StoreItem,
  Voucher,
  LedgerEntry,
  LedgerEntryType,
  WikiProfile,
  WishlistItem,
  Mood,
  MoodState,
  UserRole,
} from '../types';
import {
  DEFAULT_MOOD,
  DEFAULT_STORE_ITEMS,
  DEFAULT_TASKS,
  DEFAULT_WIKI_PROFILES,
  DEFAULT_WISHLIST,
} from '../constants';
import { loadState, saveState } from '../utils/storage';

// ─── State ───────────────────────────────────────────────

interface AppState {
  currentUser: UserRole | null;
  currentTab: TabId;
  overlay: OverlayId;
  overlayPayload: Record<string, unknown> | null;
  toast: string | null;
  points: number;
  ledger: LedgerEntry[];
  tasks: Task[];
  storeItems: StoreItem[];
  vouchers: Voucher[];
  approvals: Approval[];
  wikiProfiles: WikiProfile[];
  wishlist: WishlistItem[];
  wifeMood: MoodState;
  husbandMood: MoodState;
}

const defaultMoodState: MoodState = { current: DEFAULT_MOOD, setAt: new Date().toISOString() };

const defaultState: AppState = {
  currentUser: null,
  currentTab: 'home',
  overlay: null,
  overlayPayload: null,
  toast: null,
  points: 998,
  ledger: [],
  tasks: DEFAULT_TASKS,
  storeItems: DEFAULT_STORE_ITEMS,
  vouchers: [],
  approvals: [],
  wikiProfiles: DEFAULT_WIKI_PROFILES,
  wishlist: DEFAULT_WISHLIST,
  wifeMood: defaultMoodState,
  husbandMood: defaultMoodState,
};

// ─── Actions ─────────────────────────────────────────────

type AppAction =
  | { type: 'LOGIN'; role: UserRole }
  | { type: 'LOGOUT' }
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'OPEN_OVERLAY'; overlay: OverlayId; payload?: Record<string, unknown> }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'CLEAR_TOAST' }
  | { type: 'SUBMIT_APPROVAL'; approval: Approval }
  | { type: 'RESOLVE_APPROVAL'; id: string; status: 'approved' | 'rejected'; pointsDeducted?: number }
  | { type: 'CONDITIONAL_APPROVAL'; id: string; conditionText: string; taskId: string }
  | { type: 'CREATE_TASK'; task: Task }
  | { type: 'ACCEPT_TASK'; taskId: string }
  | { type: 'COMPLETE_TASK'; taskId: string }
  | { type: 'VERIFY_TASK'; taskId: string }
  | { type: 'CANCEL_TASK'; taskId: string }
  | { type: 'BUY_ITEM'; itemId: string; voucher: Voucher }
  | { type: 'REDEEM_VOUCHER'; voucherId: string }
  | { type: 'ADD_STORE_ITEM'; item: StoreItem }
  | { type: 'ADD_POINTS'; amount: number; description: string; entryType?: LedgerEntryType; relatedId?: string }
  | { type: 'DEDUCT_POINTS'; amount: number; description: string; entryType?: LedgerEntryType; relatedId?: string }
  | { type: 'UPDATE_PROFILE_FIELD'; profileId: 'wife' | 'husband'; key: string; value: string }
  | { type: 'ADD_WISHLIST_ITEM'; item: WishlistItem }
  | { type: 'REMOVE_WISHLIST_ITEM'; id: string }
  | { type: 'CLAIM_WISHLIST_ITEM'; id: string; claimedBy: UserRole }
  | { type: 'SET_MOOD'; mood: Mood }
  | { type: 'RESET_MOOD' }
  | { type: 'RESET_APP' };

// ─── Reducer ─────────────────────────────────────────────

function makeLedgerEntry(
  amount: number,
  description: string,
  type: LedgerEntryType,
  relatedId?: string
): LedgerEntry {
  return {
    id: `ledger_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
    relatedId,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.role, currentTab: 'home', overlay: null, overlayPayload: null };

    case 'LOGOUT':
      return { ...state, currentUser: null, overlay: null, overlayPayload: null };

    case 'SET_TAB':
      return { ...state, currentTab: action.tab, overlay: null, overlayPayload: null };

    case 'OPEN_OVERLAY':
      return { ...state, overlay: action.overlay, overlayPayload: action.payload ?? null };

    case 'CLOSE_OVERLAY':
      return { ...state, overlay: null, overlayPayload: null };

    case 'SHOW_TOAST':
      return { ...state, toast: action.message };

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    case 'SUBMIT_APPROVAL':
      return {
        ...state,
        approvals: [{ ...action.approval, submittedBy: state.currentUser ?? 'husband' }, ...state.approvals],
      };

    case 'RESOLVE_APPROVAL': {
      const now = new Date().toISOString();
      const approvals = state.approvals.map(a =>
        a.id === action.id
          ? { ...a, status: action.status as ApprovalStatus, resolvedAt: now, pointsDeducted: action.pointsDeducted }
          : a
      );
      let points = state.points;
      let ledger = state.ledger;
      if (action.status === 'approved' && action.pointsDeducted) {
        points = Math.max(0, points - action.pointsDeducted);
        const approval = state.approvals.find(a => a.id === action.id);
        ledger = [makeLedgerEntry(-action.pointsDeducted, `准奏扣分：${approval?.title ?? ''}`, 'approval_deduct', action.id), ...ledger];
      }
      return { ...state, approvals, points, ledger };
    }

    case 'CONDITIONAL_APPROVAL': {
      const now = new Date().toISOString();
      const approvals = state.approvals.map(a =>
        a.id === action.id
          ? { ...a, status: 'conditional' as ApprovalStatus, resolvedAt: now, conditionText: action.conditionText, conditionTaskId: action.taskId }
          : a
      );
      return { ...state, approvals };
    }

    case 'CREATE_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };

    case 'ACCEPT_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'accepted' as const, acceptedBy: state.currentUser ?? 'husband', acceptedAt: new Date().toISOString() }
          : t
      );
      return { ...state, tasks };
    }

    case 'COMPLETE_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'pending_verify' as const, completedAt: new Date().toISOString() }
          : t
      );
      return { ...state, tasks };
    }

    case 'VERIFY_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task) return state;
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'verified' as const, verifiedAt: new Date().toISOString() }
          : t
      );
      const points = state.points + task.reward;
      const ledger = [makeLedgerEntry(task.reward, `完成任务：${task.title}`, 'task_reward', task.id), ...state.ledger];
      return { ...state, tasks, points, ledger };
    }

    case 'CANCEL_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId ? { ...t, status: 'cancelled' as const } : t
      );
      return { ...state, tasks };
    }

    case 'BUY_ITEM': {
      const item = state.storeItems.find(i => i.id === action.itemId);
      if (!item || state.points < item.cost) return state;
      const points = state.points - item.cost;
      const ledger = [makeLedgerEntry(-item.cost, `兑换：${item.title}`, 'store_purchase', item.id), ...state.ledger];
      const vouchers = [action.voucher, ...state.vouchers];
      return { ...state, points, ledger, vouchers };
    }

    case 'REDEEM_VOUCHER': {
      const vouchers = state.vouchers.map(v =>
        v.id === action.voucherId ? { ...v, isRedeemed: true } : v
      );
      return { ...state, vouchers };
    }

    case 'ADD_STORE_ITEM':
      return { ...state, storeItems: [...state.storeItems, action.item] };

    case 'ADD_POINTS': {
      const points = state.points + action.amount;
      const ledger = [makeLedgerEntry(action.amount, action.description, action.entryType ?? 'manual_add', action.relatedId), ...state.ledger];
      return { ...state, points, ledger };
    }

    case 'DEDUCT_POINTS': {
      const points = Math.max(0, state.points - action.amount);
      const ledger = [makeLedgerEntry(-action.amount, action.description, action.entryType ?? 'manual_deduct', action.relatedId), ...state.ledger];
      return { ...state, points, ledger };
    }

    case 'UPDATE_PROFILE_FIELD': {
      const wikiProfiles = state.wikiProfiles.map(p =>
        p.id === action.profileId
          ? { ...p, fields: p.fields.map(f => f.key === action.key ? { ...f, value: action.value } : f) }
          : p
      );
      return { ...state, wikiProfiles };
    }

    case 'ADD_WISHLIST_ITEM':
      return {
        ...state,
        wishlist: [{ ...action.item, addedBy: state.currentUser ?? 'wife' }, ...state.wishlist],
      };

    case 'REMOVE_WISHLIST_ITEM':
      return { ...state, wishlist: state.wishlist.filter(w => w.id !== action.id) };

    case 'CLAIM_WISHLIST_ITEM': {
      const wishlist = state.wishlist.map(w =>
        w.id === action.id
          ? { ...w, claimedBy: action.claimedBy, claimedAt: new Date().toISOString() }
          : w
      );
      return { ...state, wishlist };
    }

    case 'SET_MOOD': {
      const moodState: MoodState = { current: action.mood, setAt: new Date().toISOString() };
      if (state.currentUser === 'wife') return { ...state, wifeMood: moodState };
      return { ...state, husbandMood: moodState };
    }

    case 'RESET_MOOD': {
      const moodState: MoodState = { current: DEFAULT_MOOD, setAt: new Date().toISOString() };
      if (state.currentUser === 'wife') return { ...state, wifeMood: moodState };
      return { ...state, husbandMood: moodState };
    }

    case 'RESET_APP':
      return { ...defaultState };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────

const AppStateContext = createContext<AppState>(defaultState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

const TRANSIENT_FIELDS: (keyof AppState)[] = ['overlay', 'overlayPayload', 'toast'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, (defaults) =>
    loadState(defaults)
  );

  useEffect(() => {
    const persisted = { ...state };
    TRANSIENT_FIELDS.forEach(f => delete (persisted as Record<string, unknown>)[f]);
    saveState(persisted);
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);

export function useCurrentMood() {
  const { currentUser, wifeMood, husbandMood } = useAppState();
  return currentUser === 'wife' ? wifeMood : husbandMood;
}

export function useToast() {
  const dispatch = useAppDispatch();
  return (message: string) => dispatch({ type: 'SHOW_TOAST', message });
}
