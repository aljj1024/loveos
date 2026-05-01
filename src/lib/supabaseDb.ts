import { supabase } from './supabase'
import type { Task, Approval, StoreItem, Voucher, LedgerEntry, WishlistItem, WikiProfile, MoodState } from '../types'
import { DEFAULT_MOOD, DEFAULT_STORE_ITEMS, DEFAULT_WIKI_PROFILES } from '../constants'

// ─── Row transformers (DB snake_case → TS camelCase) ─────────────────────────

export function taskFromRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    icon: row.icon as string,
    reward: row.reward as number,
    createdBy: row.created_by as Task['createdBy'],
    acceptedBy: row.accepted_by as Task['acceptedBy'] | undefined,
    status: row.status as Task['status'],
    createdAt: row.created_at as string,
    acceptedAt: row.accepted_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    verifiedAt: row.verified_at as string | undefined,
    sourceApprovalId: row.source_approval_id as string | undefined,
  }
}

export function approvalFromRow(row: Record<string, unknown>): Approval {
  return {
    id: row.id as string,
    template: row.template as Approval['template'],
    title: row.title as string,
    reason: row.reason as string,
    datetime: row.datetime as string,
    sincerity: row.sincerity as string,
    submittedAt: row.submitted_at as string,
    submittedBy: row.submitted_by as Approval['submittedBy'],
    status: row.status as Approval['status'],
    resolvedAt: row.resolved_at as string | undefined,
    conditionText: row.condition_text as string | undefined,
    conditionTaskId: row.condition_task_id as string | undefined,
    pointsDeducted: row.points_deducted as number | undefined,
  }
}

export function storeItemFromRow(row: Record<string, unknown>): StoreItem {
  return {
    id: row.id as string,
    title: row.title as string,
    cost: row.cost as number,
    icon: row.icon as string,
    colorClass: row.color_class as string,
    isCustom: row.is_custom as boolean,
    createdBy: row.created_by as StoreItem['createdBy'],
  }
}

export function voucherFromRow(row: Record<string, unknown>): Voucher {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    itemTitle: row.item_title as string,
    itemIcon: row.item_icon as string,
    purchasedAt: row.purchased_at as string,
    purchasedBy: row.purchased_by as Voucher['purchasedBy'],
    isRedeemed: row.is_redeemed as boolean,
    pendingRedemption: (row.pending_redemption as boolean) ?? false,
    confirmedBy: row.confirmed_by as Voucher['confirmedBy'],
    confirmedAt: row.confirmed_at as string | undefined,
  }
}

export function ledgerFromRow(row: Record<string, unknown>): LedgerEntry {
  return {
    id: row.id as string,
    type: row.type as LedgerEntry['type'],
    amount: row.amount as number,
    description: row.description as string,
    timestamp: row.timestamp as string,
    relatedId: row.related_id as string | undefined,
  }
}

export function wishlistFromRow(row: Record<string, unknown>): WishlistItem {
  return {
    id: row.id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    notes: row.notes as string | undefined,
    addedAt: row.added_at as string,
    addedBy: row.added_by as WishlistItem['addedBy'],
    claimedBy: row.claimed_by as WishlistItem['claimedBy'],
    claimedAt: row.claimed_at as string | undefined,
  }
}

// ─── Load full state ──────────────────────────────────────────────────────────

export interface SupabaseAppState {
  points: number
  wikiProfiles: WikiProfile[]
  wifeMood: MoodState
  husbandMood: MoodState
  tasks: Task[]
  approvals: Approval[]
  storeItems: StoreItem[]
  vouchers: Voucher[]
  ledger: LedgerEntry[]
  wishlist: WishlistItem[]
}

export async function loadStateFromSupabase(coupleId: string): Promise<SupabaseAppState> {
  const defaultMoodState: MoodState = { current: DEFAULT_MOOD, setAt: new Date().toISOString() }

  const [
    { data: cs },
    { data: tasks },
    { data: approvals },
    { data: storeItems },
    { data: vouchers },
    { data: ledger },
    { data: wishlist },
  ] = await Promise.all([
    supabase.from('couple_state').select('*').eq('couple_id', coupleId).single(),
    supabase.from('tasks').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false }),
    supabase.from('approvals').select('*').eq('couple_id', coupleId).order('submitted_at', { ascending: false }),
    supabase.from('store_items').select('*').eq('couple_id', coupleId),
    supabase.from('vouchers').select('*').eq('couple_id', coupleId).order('purchased_at', { ascending: false }),
    supabase.from('ledger_entries').select('*').eq('couple_id', coupleId).order('timestamp', { ascending: false }),
    supabase.from('wishlist_items').select('*').eq('couple_id', coupleId).order('added_at', { ascending: false }),
  ])

  return {
    points: cs?.points ?? 998,
    wikiProfiles: (cs?.wiki_profiles as WikiProfile[]) ?? DEFAULT_WIKI_PROFILES,
    wifeMood: (cs?.wife_mood as MoodState | null) ?? defaultMoodState,
    husbandMood: (cs?.husband_mood as MoodState | null) ?? defaultMoodState,
    tasks: tasks?.map(taskFromRow) ?? [],
    approvals: approvals?.map(approvalFromRow) ?? [],
    storeItems: storeItems?.length ? storeItems.map(storeItemFromRow) : DEFAULT_STORE_ITEMS,
    vouchers: vouchers?.map(voucherFromRow) ?? [],
    ledger: ledger?.map(ledgerFromRow) ?? [],
    wishlist: wishlist?.map(wishlistFromRow) ?? [],
  }
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

export async function upsertTask(coupleId: string, task: Task) {
  const { error } = await supabase.from('tasks').upsert({
    id: task.id,
    couple_id: coupleId,
    title: task.title,
    description: task.description ?? null,
    icon: task.icon,
    reward: task.reward,
    created_by: task.createdBy,
    accepted_by: task.acceptedBy ?? null,
    status: task.status,
    created_at: task.createdAt,
    accepted_at: task.acceptedAt ?? null,
    completed_at: task.completedAt ?? null,
    verified_at: task.verifiedAt ?? null,
    source_approval_id: task.sourceApprovalId ?? null,
  })
  if (error) console.error('upsertTask', error)
}

export async function upsertApproval(coupleId: string, approval: Approval) {
  const { error } = await supabase.from('approvals').upsert({
    id: approval.id,
    couple_id: coupleId,
    template: approval.template,
    title: approval.title,
    reason: approval.reason,
    datetime: approval.datetime,
    sincerity: approval.sincerity,
    submitted_at: approval.submittedAt,
    submitted_by: approval.submittedBy ?? null,
    status: approval.status,
    resolved_at: approval.resolvedAt ?? null,
    condition_text: approval.conditionText ?? null,
    condition_task_id: approval.conditionTaskId ?? null,
    points_deducted: approval.pointsDeducted ?? null,
  })
  if (error) console.error('upsertApproval', error)
}

export async function upsertCoupleState(
  coupleId: string,
  patch: Pick<SupabaseAppState, 'points' | 'wikiProfiles' | 'wifeMood' | 'husbandMood'>,
) {
  const { error } = await supabase.from('couple_state').upsert({
    couple_id: coupleId,
    points: patch.points,
    wiki_profiles: patch.wikiProfiles,
    wife_mood: patch.wifeMood,
    husband_mood: patch.husbandMood,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error('upsertCoupleState', error)
}

export async function upsertStoreItem(coupleId: string, item: StoreItem) {
  const { error } = await supabase.from('store_items').upsert({
    id: item.id,
    couple_id: coupleId,
    title: item.title,
    cost: item.cost,
    icon: item.icon,
    color_class: item.colorClass,
    is_custom: item.isCustom,
    created_by: item.createdBy ?? null,
  })
  if (error) console.error('upsertStoreItem', error)
}

export async function upsertVoucher(coupleId: string, voucher: Voucher) {
  const { error } = await supabase.from('vouchers').upsert({
    id: voucher.id,
    couple_id: coupleId,
    item_id: voucher.itemId,
    item_title: voucher.itemTitle,
    item_icon: voucher.itemIcon,
    purchased_at: voucher.purchasedAt,
    purchased_by: voucher.purchasedBy ?? null,
    is_redeemed: voucher.isRedeemed,
    pending_redemption: voucher.pendingRedemption,
    confirmed_by: voucher.confirmedBy ?? null,
    confirmed_at: voucher.confirmedAt ?? null,
  })
  if (error) console.error('upsertVoucher', error)
}

export async function insertLedgerEntry(coupleId: string, entry: LedgerEntry) {
  const { error } = await supabase.from('ledger_entries').upsert({
    id: entry.id,
    couple_id: coupleId,
    type: entry.type,
    amount: entry.amount,
    description: entry.description,
    timestamp: entry.timestamp,
    related_id: entry.relatedId ?? null,
  })
  if (error) console.error('insertLedgerEntry', error)
}

export async function upsertWishlistItem(coupleId: string, item: WishlistItem) {
  const { error } = await supabase.from('wishlist_items').upsert({
    id: item.id,
    couple_id: coupleId,
    name: item.name,
    emoji: item.emoji,
    notes: item.notes ?? null,
    added_at: item.addedAt,
    added_by: item.addedBy ?? null,
    claimed_by: item.claimedBy ?? null,
    claimed_at: item.claimedAt ?? null,
  })
  if (error) console.error('upsertWishlistItem', error)
}

export async function deleteWishlistItem(coupleId: string, id: string) {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id)
    .eq('couple_id', coupleId)
  if (error) console.error('deleteWishlistItem', error)
}

// ─── Couple management ────────────────────────────────────────────────────────

export function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function getCoupleId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('couples')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .maybeSingle()
  return data?.id ?? null
}

export async function createCouple(userId: string): Promise<{ coupleId: string; inviteCode: string }> {
  const inviteCode = generateInviteCode()

  const { data, error } = await supabase
    .from('couples')
    .insert({ user1_id: userId, invite_code: inviteCode })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const coupleId = data.id as string

  await supabase.from('couple_state').insert({
    couple_id: coupleId,
    points: 998,
    wiki_profiles: DEFAULT_WIKI_PROFILES,
    wife_mood: null,
    husband_mood: null,
  })

  await supabase.from('store_items').insert(
    DEFAULT_STORE_ITEMS.map(item => ({
      id: item.id,
      couple_id: coupleId,
      title: item.title,
      cost: item.cost,
      icon: item.icon,
      color_class: item.colorClass,
      is_custom: false,
      created_by: null,
    })),
  )

  return { coupleId, inviteCode }
}

export async function getPartnerUserId(coupleId: string, myUserId: string): Promise<string | null> {
  const { data } = await supabase
    .from('couples')
    .select('user1_id, user2_id')
    .eq('id', coupleId)
    .single()
  if (!data) return null
  return data.user1_id === myUserId ? (data.user2_id as string | null) : (data.user1_id as string | null)
}

export async function joinCouple(userId: string, inviteCode: string): Promise<string> {
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select('id, user1_id, user2_id')
    .eq('invite_code', inviteCode.toUpperCase())
    .maybeSingle()

  if (findError || !couple) throw new Error('邀请码无效，请检查后重试')
  if (couple.user2_id) throw new Error('该邀请码已被使用')
  if (couple.user1_id === userId) throw new Error('不能和自己配对哦')

  const { error: joinError } = await supabase
    .from('couples')
    .update({ user2_id: userId })
    .eq('id', couple.id)

  if (joinError) throw new Error(joinError.message)

  return couple.id as string
}
