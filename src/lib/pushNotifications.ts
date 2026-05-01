import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  let padded = base64String.replace(/-/g, '+').replace(/_/g, '/')
  while (padded.length % 4) padded += '='
  const raw = atob(padded)
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return reg
  } catch {
    return null
  }
}

export async function subscribeToPush(
  coupleId: string,
  userId: string,
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY) return false

  const reg = await registerServiceWorker()
  if (!reg) return false

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const existing = await reg.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    })

    const { error } = await supabase.from('push_subscriptions').upsert({
      couple_id: coupleId,
      user_id: userId,
      subscription: sub.toJSON(),
    }, { onConflict: 'user_id' })

    return !error
  } catch (err) {
    console.error('Push subscribe error:', err)
    return false
  }
}

export async function notifyPartner(
  coupleId: string,
  recipientUserId: string,
  title: string,
  body: string,
  tag?: string,
): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ coupleId, recipientUserId, title, body, tag }),
    })
  } catch (err) {
    console.error('notifyPartner error:', err)
  }
}
