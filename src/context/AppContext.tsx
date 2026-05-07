import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react'
import type { Dispatch } from 'react'
import type { Session } from '@supabase/supabase-js'
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
} from '../types'
import {
  DEFAULT_MOOD,
  DEFAULT_STORE_ITEMS,
  DEFAULT_TASKS,
  DEFAULT_WIKI_PROFILES,
  DEFAULT_WISHLIST,
} from '../constants'
import { loadState, saveState } from '../utils/storage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  loadStateFromSupabase,
  getCoupleId,
  getPartnerUserId,
  upsertTask,
  upsertApproval,
  upsertCoupleState,
  upsertStoreItem,
  upsertVoucher,
  insertLedgerEntry,
  upsertWishlistItem,
  deleteWishlistItem,
  taskFromRow,
  approvalFromRow,
  storeItemFromRow,
  voucherFromRow,
  ledgerFromRow,
  wishlistFromRow,
} from '../lib/supabaseDb'
import { subscribeToPush, notifyPartner } from '../lib/pushNotifications'

// ─── State ───────────────────────────────────────────────

export interface AppState {
  currentUser: UserRole | null
  currentTab: TabId
  overlay: OverlayId
  overlayPayload: Record<string, unknown> | null
  toast: string | null
  points: number
  ledger: LedgerEntry[]
  tasks: Task[]
  storeItems: StoreItem[]
  vouchers: Voucher[]
  approvals: Approval[]
  wikiProfiles: WikiProfile[]
  wishlist: WishlistItem[]
  wifeMood: MoodState
  husbandMood: MoodState
  flipMode: boolean
}

const defaultMoodState: MoodState = { current: DEFAULT_MOOD, setAt: new Date().toISOString() }

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
  flipMode: false,
}

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
  | { type: 'CONFIRM_VOUCHER'; voucherId: string }
  | { type: 'REJECT_VOUCHER'; voucherId: string }
  | { type: 'ADD_STORE_ITEM'; item: StoreItem }
  | { type: 'REMOVE_STORE_ITEM'; itemId: string }
  | { type: 'TOGGLE_FLIP_MODE' }
  | { type: 'ADD_POINTS'; amount: number; description: string; entryType?: LedgerEntryType; relatedId?: string }
  | { type: 'DEDUCT_POINTS'; amount: number; description: string; entryType?: LedgerEntryType; relatedId?: string }
  | { type: 'UPDATE_PROFILE_FIELD'; profileId: 'wife' | 'husband'; key: string; value: string }
  | { type: 'ADD_WISHLIST_ITEM'; item: WishlistItem }
  | { type: 'REMOVE_WISHLIST_ITEM'; id: string }
  | { type: 'CLAIM_WISHLIST_ITEM'; id: string; claimedBy: UserRole }
  | { type: 'SET_MOOD'; mood: Mood }
  | { type: 'RESET_MOOD' }
  | { type: 'RESET_APP' }
  | { type: 'HYDRATE'; patch: Partial<AppState> }

// ─── Reducer ─────────────────────────────────────────────

function makeLedgerEntry(
  amount: number,
  description: string,
  type: LedgerEntryType,
  relatedId?: string,
): LedgerEntry {
  return {
    id: `ledger_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
    relatedId,
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.patch }

    case 'LOGIN':
      return { ...state, currentUser: action.role, currentTab: 'home', overlay: null, overlayPayload: null }

    case 'LOGOUT':
      return { ...state, currentUser: null, overlay: null, overlayPayload: null }

    case 'SET_TAB':
      return { ...state, currentTab: action.tab, overlay: null, overlayPayload: null }

    case 'OPEN_OVERLAY':
      return { ...state, overlay: action.overlay, overlayPayload: action.payload ?? null }

    case 'CLOSE_OVERLAY':
      return { ...state, overlay: null, overlayPayload: null }

    case 'SHOW_TOAST':
      return { ...state, toast: action.message }

    case 'CLEAR_TOAST':
      return { ...state, toast: null }

    case 'SUBMIT_APPROVAL':
      return {
        ...state,
        approvals: [{ ...action.approval, submittedBy: state.currentUser ?? 'husband' }, ...state.approvals],
      }

    case 'RESOLVE_APPROVAL': {
      const now = new Date().toISOString()
      const approvals = state.approvals.map(a =>
        a.id === action.id
          ? { ...a, status: action.status as ApprovalStatus, resolvedAt: now, pointsDeducted: action.pointsDeducted }
          : a,
      )
      let points = state.points
      let ledger = state.ledger
      if (action.status === 'approved' && action.pointsDeducted) {
        points = Math.max(0, points - action.pointsDeducted)
        const approval = state.approvals.find(a => a.id === action.id)
        ledger = [makeLedgerEntry(-action.pointsDeducted, `准奏扣分：${approval?.title ?? ''}`, 'approval_deduct', action.id), ...ledger]
      }
      return { ...state, approvals, points, ledger }
    }

    case 'CONDITIONAL_APPROVAL': {
      const now = new Date().toISOString()
      const approvals = state.approvals.map(a =>
        a.id === action.id
          ? { ...a, status: 'conditional' as ApprovalStatus, resolvedAt: now, conditionText: action.conditionText, conditionTaskId: action.taskId }
          : a,
      )
      return { ...state, approvals }
    }

    case 'CREATE_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] }

    case 'ACCEPT_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'accepted' as const, acceptedBy: state.currentUser ?? 'husband', acceptedAt: new Date().toISOString() }
          : t,
      )
      return { ...state, tasks }
    }

    case 'COMPLETE_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'pending_verify' as const, completedAt: new Date().toISOString() }
          : t,
      )
      return { ...state, tasks }
    }

    case 'VERIFY_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId)
      if (!task) return state
      const tasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, status: 'verified' as const, verifiedAt: new Date().toISOString() }
          : t,
      )
      const points = state.points + task.reward
      const ledger = [makeLedgerEntry(task.reward, `缴差入帐：${task.title}`, 'task_reward', task.id), ...state.ledger]
      return { ...state, tasks, points, ledger }
    }

    case 'CANCEL_TASK': {
      const tasks = state.tasks.map(t =>
        t.id === action.taskId ? { ...t, status: 'cancelled' as const } : t,
      )
      return { ...state, tasks }
    }

    case 'BUY_ITEM': {
      const item = state.storeItems.find(i => i.id === action.itemId)
      if (!item || state.points < item.cost) return state
      const points = state.points - item.cost
      const ledger = [makeLedgerEntry(-item.cost, `赎权：${item.title}`, 'store_purchase', item.id), ...state.ledger]
      const vouchers = [action.voucher, ...state.vouchers]
      return { ...state, points, ledger, vouchers }
    }

    case 'REDEEM_VOUCHER': {
      const vouchers = state.vouchers.map(v =>
        v.id === action.voucherId ? { ...v, pendingRedemption: true } : v,
      )
      return { ...state, vouchers }
    }

    case 'CONFIRM_VOUCHER': {
      const vouchers = state.vouchers.map(v =>
        v.id === action.voucherId
          ? { ...v, isRedeemed: true, pendingRedemption: false, confirmedBy: state.currentUser ?? undefined, confirmedAt: new Date().toISOString() }
          : v,
      )
      return { ...state, vouchers }
    }

    case 'REJECT_VOUCHER': {
      const vouchers = state.vouchers.map(v =>
        v.id === action.voucherId ? { ...v, pendingRedemption: false } : v,
      )
      return { ...state, vouchers }
    }

    case 'ADD_STORE_ITEM':
      return { ...state, storeItems: [...state.storeItems, action.item] }

    case 'REMOVE_STORE_ITEM':
      return { ...state, storeItems: state.storeItems.filter(i => i.id !== action.itemId) }

    case 'TOGGLE_FLIP_MODE':
      return { ...state, flipMode: !state.flipMode }

    case 'ADD_POINTS': {
      const points = state.points + action.amount
      const ledger = [makeLedgerEntry(action.amount, action.description, action.entryType ?? 'manual_add', action.relatedId), ...state.ledger]
      return { ...state, points, ledger }
    }

    case 'DEDUCT_POINTS': {
      const points = Math.max(0, state.points - action.amount)
      const ledger = [makeLedgerEntry(-action.amount, action.description, action.entryType ?? 'manual_deduct', action.relatedId), ...state.ledger]
      return { ...state, points, ledger }
    }

    case 'UPDATE_PROFILE_FIELD': {
      const wikiProfiles = state.wikiProfiles.map(p =>
        p.id === action.profileId
          ? { ...p, fields: p.fields.map(f => f.key === action.key ? { ...f, value: action.value } : f) }
          : p,
      )
      return { ...state, wikiProfiles }
    }

    case 'ADD_WISHLIST_ITEM':
      return {
        ...state,
        wishlist: [{ ...action.item, addedBy: state.currentUser ?? 'wife' }, ...state.wishlist],
      }

    case 'REMOVE_WISHLIST_ITEM':
      return { ...state, wishlist: state.wishlist.filter(w => w.id !== action.id) }

    case 'CLAIM_WISHLIST_ITEM': {
      const wishlist = state.wishlist.map(w =>
        w.id === action.id
          ? { ...w, claimedBy: action.claimedBy, claimedAt: new Date().toISOString() }
          : w,
      )
      return { ...state, wishlist }
    }

    case 'SET_MOOD': {
      const moodState: MoodState = { current: action.mood, setAt: new Date().toISOString() }
      if (state.currentUser === 'wife') return { ...state, wifeMood: moodState }
      return { ...state, husbandMood: moodState }
    }

    case 'RESET_MOOD': {
      const moodState: MoodState = { current: DEFAULT_MOOD, setAt: new Date().toISOString() }
      if (state.currentUser === 'wife') return { ...state, wifeMood: moodState }
      return { ...state, husbandMood: moodState }
    }

    case 'RESET_APP':
      return { ...defaultState }

    default:
      return state
  }
}

// ─── Auth Context ─────────────────────────────────────────

interface AuthContextType {
  session: Session | null
  coupleId: string | null
  authLoading: boolean
  setCoupleId: (id: string) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  coupleId: null,
  authLoading: false,
  setCoupleId: () => {},
})

export const useAuthState = () => useContext(AuthContext)

// ─── App Context ──────────────────────────────────────────

const AppStateContext = createContext<AppState>(defaultState)
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {})

const TRANSIENT_FIELDS: (keyof AppState)[] = ['overlay', 'overlayPayload', 'toast']

// ─── Supabase sync (per-action) ───────────────────────────

async function syncActionToSupabase(coupleId: string, myUserId: string, action: AppAction, newState: AppState) {
  // Helper: fire-and-forget push to partner
  async function pushPartner(title: string, body: string, tag?: string) {
    const partnerId = await getPartnerUserId(coupleId, myUserId)
    if (partnerId) notifyPartner(coupleId, partnerId, title, body, tag).catch(() => {})
  }

  switch (action.type) {
    case 'CREATE_TASK': {
      const task = newState.tasks.find(t => t.id === action.task.id)
      if (task) await upsertTask(coupleId, task)
      pushPartner('📋 新旨意颁发', `「${task?.title ?? ''}」悬赏 ${task?.reward ?? 0} 🪙，快接旨听差`, 'task')
      break
    }
    case 'ACCEPT_TASK': {
      const task = newState.tasks.find(t => t.id === action.taskId)
      if (task) await upsertTask(coupleId, task)
      pushPartner('✅ 旨意已被领', `「${task?.title ?? ''}」已被接领，待复命`, 'task')
      break
    }
    case 'COMPLETE_TASK': {
      const task = newState.tasks.find(t => t.id === action.taskId)
      if (task) await upsertTask(coupleId, task)
      pushPartner('📤 旨意待阅', `「${task?.title ?? ''}」已复命，请陛下阅旨`, 'task')
      break
    }
    case 'CANCEL_TASK': {
      const task = newState.tasks.find(t => t.id === action.taskId)
      if (task) await upsertTask(coupleId, task)
      break
    }
    case 'VERIFY_TASK': {
      const task = newState.tasks.find(t => t.id === action.taskId)
      if (task) await upsertTask(coupleId, task)
      await upsertCoupleState(coupleId, newState)
      const entry = newState.ledger[0]
      if (entry) await insertLedgerEntry(coupleId, entry)
      pushPartner('🎉 旨意阅毕', `「${task?.title ?? ''}」阅旨通过，+${task?.reward ?? 0} 🪙`, 'task')
      break
    }

    case 'SUBMIT_APPROVAL': {
      const approval = newState.approvals.find(a => a.id === action.approval.id)
      if (approval) await upsertApproval(coupleId, approval)
      pushPartner('📜 新奏折待批阅', `「${approval?.title ?? ''}」请及时朱批`, 'approval')
      break
    }
    case 'RESOLVE_APPROVAL': {
      const approval = newState.approvals.find(a => a.id === action.id)
      if (approval) await upsertApproval(coupleId, approval)
      if (action.pointsDeducted) {
        await upsertCoupleState(coupleId, newState)
        const entry = newState.ledger[0]
        if (entry) await insertLedgerEntry(coupleId, entry)
      }
      const label = action.status === 'approved' ? '已准奏 ✅' : '已驳回 ❌'
      pushPartner(`奏折${label}`, `「${approval?.title ?? ''}」${label}`, 'approval')
      break
    }
    case 'CONDITIONAL_APPROVAL': {
      const approval = newState.approvals.find(a => a.id === action.id)
      if (approval) await upsertApproval(coupleId, approval)
      pushPartner('📎 准奏附条件', `「${approval?.title ?? ''}」附条：${action.conditionText}`, 'approval')
      break
    }

    case 'BUY_ITEM': {
      await upsertCoupleState(coupleId, newState)
      await upsertVoucher(coupleId, action.voucher)
      const entry = newState.ledger[0]
      if (entry) await insertLedgerEntry(coupleId, entry)
      break
    }
    case 'REDEEM_VOUCHER': {
      const voucher = newState.vouchers.find(v => v.id === action.voucherId)
      if (voucher) await upsertVoucher(coupleId, voucher)
      pushPartner('✂️ 恩诏核销申请', `对方请核销「${voucher?.itemTitle ?? ''}」恩诏，请圣允`, 'voucher')
      break
    }
    case 'CONFIRM_VOUCHER': {
      const voucher = newState.vouchers.find(v => v.id === action.voucherId)
      if (voucher) await upsertVoucher(coupleId, voucher)
      pushPartner('✅ 恩诏核销已圣允', `「${voucher?.itemTitle ?? ''}」已圣允核销`, 'voucher')
      break
    }
    case 'REJECT_VOUCHER': {
      const voucher = newState.vouchers.find(v => v.id === action.voucherId)
      if (voucher) await upsertVoucher(coupleId, voucher)
      pushPartner('❌ 恩诏核销被驳', `「${voucher?.itemTitle ?? ''}」核销申请已被驳回`, 'voucher')
      break
    }
    case 'ADD_STORE_ITEM':
      await upsertStoreItem(coupleId, action.item)
      break

    case 'ADD_POINTS':
    case 'DEDUCT_POINTS': {
      await upsertCoupleState(coupleId, newState)
      const entry = newState.ledger[0]
      if (entry) await insertLedgerEntry(coupleId, entry)
      break
    }

    case 'UPDATE_PROFILE_FIELD':
      await upsertCoupleState(coupleId, newState)
      break

    case 'ADD_WISHLIST_ITEM': {
      const item = newState.wishlist.find(w => w.id === action.item.id)
      if (item) await upsertWishlistItem(coupleId, item)
      break
    }
    case 'REMOVE_WISHLIST_ITEM':
      await deleteWishlistItem(coupleId, action.id)
      break
    case 'CLAIM_WISHLIST_ITEM': {
      const item = newState.wishlist.find(w => w.id === action.id)
      if (item) await upsertWishlistItem(coupleId, item)
      break
    }

    case 'SET_MOOD':
    case 'RESET_MOOD':
      await upsertCoupleState(coupleId, newState)
      break

    // No Supabase sync for UI-only actions
    default:
      break
  }
}

// ─── Provider ─────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)

  const [state, dispatch] = useReducer(reducer, defaultState, (defaults) => loadState(defaults))
  const stateRef = useRef(state)
  stateRef.current = state
  const coupleIdRef = useRef(coupleId)
  coupleIdRef.current = coupleId
  const sessionRef = useRef(session)
  sessionRef.current = session

  // Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return
    }

    const loadingTimeout = setTimeout(() => setAuthLoading(false), 8000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const id = await getCoupleId(session.user.id)
        setCoupleId(id)
      }
      clearTimeout(loadingTimeout)
      setAuthLoading(false)
    }).catch(() => {
      clearTimeout(loadingTimeout)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        try {
          const id = await getCoupleId(session.user.id)
          setCoupleId(id)
        } catch {
          // ignore, user can retry
        }
      } else {
        setCoupleId(null)
        dispatch({ type: 'RESET_APP' })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load state from Supabase when coupleId is first set
  useEffect(() => {
    if (!coupleId || !isSupabaseConfigured) return
    loadStateFromSupabase(coupleId).then(patch => {
      dispatch({ type: 'HYDRATE', patch })
    })
  }, [coupleId])

  // Realtime subscriptions
  useEffect(() => {
    if (!coupleId || !isSupabaseConfigured) return

    const channel = supabase
      .channel(`couple-${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('tasks').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
        if (data) dispatch({ type: 'HYDRATE', patch: { tasks: data.map(r => taskFromRow(r as Record<string, unknown>)) } })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('approvals').select('*').eq('couple_id', coupleId).order('submitted_at', { ascending: false })
        if (data) dispatch({ type: 'HYDRATE', patch: { approvals: data.map(r => approvalFromRow(r as Record<string, unknown>)) } })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_state', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('couple_state').select('*').eq('couple_id', coupleId).maybeSingle()
        if (data) dispatch({ type: 'HYDRATE', patch: {
          points: data.points as number,
          wikiProfiles: data.wiki_profiles as WikiProfile[],
          wifeMood: (data.wife_mood as MoodState | null) ?? stateRef.current.wifeMood,
          husbandMood: (data.husband_mood as MoodState | null) ?? stateRef.current.husbandMood,
        }})
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vouchers', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('vouchers').select('*').eq('couple_id', coupleId).order('purchased_at', { ascending: false })
        if (data) dispatch({ type: 'HYDRATE', patch: { vouchers: data.map(r => voucherFromRow(r as Record<string, unknown>)) } })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_items', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('store_items').select('*').eq('couple_id', coupleId)
        if (data) dispatch({ type: 'HYDRATE', patch: { storeItems: data.map(r => storeItemFromRow(r as Record<string, unknown>)) } })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ledger_entries', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('ledger_entries').select('*').eq('couple_id', coupleId).order('timestamp', { ascending: false })
        if (data) dispatch({ type: 'HYDRATE', patch: { ledger: data.map(r => ledgerFromRow(r as Record<string, unknown>)) } })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items', filter: `couple_id=eq.${coupleId}` }, async () => {
        const { data } = await supabase.from('wishlist_items').select('*').eq('couple_id', coupleId).order('added_at', { ascending: false })
        if (data) dispatch({ type: 'HYDRATE', patch: { wishlist: data.map(r => wishlistFromRow(r as Record<string, unknown>)) } })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [coupleId])

  // Subscribe to push when couple is paired and user is logged in
  useEffect(() => {
    if (!coupleId || !isSupabaseConfigured) return
    const userId = sessionRef.current?.user.id
    if (!userId) return
    subscribeToPush(coupleId, userId).catch(() => {})
  }, [coupleId])

  // Wrapped dispatch: update local state + sync to Supabase
  const wrappedDispatch = useCallback((action: AppAction) => {
    dispatch(action)
    const id = coupleIdRef.current
    const userId = sessionRef.current?.user.id
    if (id && userId && isSupabaseConfigured && action.type !== 'HYDRATE') {
      const newState = reducer(stateRef.current, action)
      syncActionToSupabase(id, userId, action, newState).catch(console.error)
    }
  }, [])

  // localStorage fallback (only when Supabase not configured)
  useEffect(() => {
    if (isSupabaseConfigured) return
    const persisted = { ...state }
    TRANSIENT_FIELDS.forEach(f => delete (persisted as Record<string, unknown>)[f])
    saveState(persisted)
  }, [state])

  return (
    <AuthContext.Provider value={{ session, coupleId, authLoading, setCoupleId }}>
      <AppStateContext.Provider value={state}>
        <AppDispatchContext.Provider value={wrappedDispatch}>
          {children}
        </AppDispatchContext.Provider>
      </AppStateContext.Provider>
    </AuthContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext)
export const useAppDispatch = () => useContext(AppDispatchContext)

export function useCurrentMood() {
  const { currentUser, wifeMood, husbandMood } = useAppState()
  return currentUser === 'wife' ? wifeMood : husbandMood
}

export function useToast() {
  const dispatch = useAppDispatch()
  return (message: string) => dispatch({ type: 'SHOW_TOAST', message })
}

export function usePendingCounts() {
  const { approvals, vouchers, tasks, currentUser } = useAppState()

  const homeCount = approvals.filter(
    a => a.status === 'pending' && a.submittedBy !== currentUser,
  ).length

  const economyCount =
    vouchers.filter(v => v.pendingRedemption && v.purchasedBy !== currentUser).length +
    tasks.filter(t => t.createdBy === currentUser && t.status === 'pending_verify').length

  return { homeCount, economyCount, total: homeCount + economyCount }
}
