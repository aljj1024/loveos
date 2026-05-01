import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = 'mailto:admin@loveos.app'

// ─── VAPID signing helpers ────────────────────────────────────────────────────

function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Uint8Array.from(atob(s), c => c.charCodeAt(0))
}

function b64urlEncode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function buildVapidHeaders(audience: string): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  const now = Math.floor(Date.now() / 1000)
  const payload = { aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT }
  const header = { typ: 'JWT', alg: 'ES256' }

  const enc = new TextEncoder()
  const headerB64 = b64urlEncode(enc.encode(JSON.stringify(header)))
  const payloadB64 = b64urlEncode(enc.encode(JSON.stringify(payload)))
  const sigInput = enc.encode(`${headerB64}.${payloadB64}`)

  const rawPriv = b64urlDecode(VAPID_PRIVATE_KEY)
  const privKey = await crypto.subtle.importKey(
    'pkcs8',
    buildPKCS8(rawPriv),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const sigRaw = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, sigInput)
  const jwt = `${headerB64}.${payloadB64}.${b64urlEncode(sigRaw)}`

  return {
    Authorization: `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
    'Crypto-Key': `p256ecdh=${VAPID_PUBLIC_KEY}`,
  }
}

function buildPKCS8(rawD: Uint8Array): ArrayBuffer {
  // PKCS8 wrapper for P-256 private key (RFC 5915 inside PKCS8)
  const ecPriv = new Uint8Array([
    0x30, 0x77,           // SEQUENCE
    0x02, 0x01, 0x01,     // version = 1
    0x04, 0x20, ...rawD,  // privateKey
    0xa0, 0x0a,           // [0] EXPLICIT
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // P-256 OID
    0xa1, 0x44,           // [1] EXPLICIT
    0x03, 0x42, 0x00,     // BIT STRING
    ...b64urlDecode(VAPID_PUBLIC_KEY), // uncompressed public key
  ])
  const wrapper = new Uint8Array([
    0x30, 0x41,           // SEQUENCE
    0x02, 0x01, 0x00,     // version
    0x30, 0x13,           // SEQUENCE (AlgorithmIdentifier)
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // ecPublicKey OID
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // P-256 OID
    0x04, 0x27,           // OCTET STRING
    ...ecPriv,
  ])
  return wrapper.buffer
}

// ─── Web Push encryption (simplified — AESGCM via ece) ───────────────────────
// We delegate encryption to the browser push endpoint, sending only the JWT.
// For the payload we use the "aesgcm" scheme via SubtleCrypto.

async function encryptPayload(
  subscription: { keys: { p256dh: string; auth: string } },
  plaintext: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const enc = new TextEncoder()
  const plainBytes = enc.encode(plaintext)

  // Generate ephemeral sender key pair
  const senderKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const senderPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', senderKeyPair.publicKey))

  // Import receiver public key
  const receiverPub = await crypto.subtle.importKey(
    'raw', b64urlDecode(subscription.keys.p256dh),
    { name: 'ECDH', namedCurve: 'P-256' }, false, [],
  )

  // ECDH shared secret
  const sharedBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: receiverPub }, senderKeyPair.privateKey, 256)

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const authSecret = b64urlDecode(subscription.keys.auth)

  // HKDF PRK from auth
  const prkKey = await crypto.subtle.importKey('raw', authSecret, { name: 'HKDF' }, false, ['deriveBits'])
  // NIST SP 800-56C — simplified: derive content encryption key
  const hkdfInfo = concat(enc.encode('Content-Encoding: aesgcm\0'), enc.encode('\0'), senderPubRaw, b64urlDecode(subscription.keys.p256dh))
  const ikm = new Uint8Array(sharedBits)
  const ikmKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits'])
  const cekBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: hkdfInfo }, ikmKey, 128)
  const nonceInfo = concat(enc.encode('Content-Encoding: nonce\0'), enc.encode('\0'), senderPubRaw, b64urlDecode(subscription.keys.p256dh))
  const nonceBits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, ikmKey, 96)

  const cekKeyObj = await crypto.subtle.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt'])
  // Pad plaintext (2 bytes padding length + payload)
  const padded = new Uint8Array(2 + plainBytes.length)
  padded.set(plainBytes, 2)

  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonceBits }, cekKeyObj, padded))

  return { ciphertext, salt, serverPublicKey: senderPubRaw }

  void prkKey
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

// ─── Send one push ────────────────────────────────────────────────────────────

async function sendOnePush(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  notification: { title: string; body: string; tag?: string },
) {
  const url = new URL(sub.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const vapidHeaders = await buildVapidHeaders(audience)

  const payload = JSON.stringify(notification)
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(sub, payload)

  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      ...vapidHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aesgcm',
      Encryption: `salt=${b64urlEncode(salt.buffer)}`,
      'Crypto-Key': `${vapidHeaders['Crypto-Key']};dh=${b64urlEncode(serverPublicKey.buffer)}`,
      TTL: '86400',
    },
    body: ciphertext,
  })

  if (!res.ok && res.status !== 201) {
    console.error('Push failed:', res.status, await res.text())
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
  }

  try {
    const { coupleId, recipientUserId, title, body, tag } = await req.json()

    if (!coupleId || !recipientUserId || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipientUserId)
      .eq('couple_id', coupleId)

    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    await Promise.all(
      subs.map(row => sendOnePush(row.subscription as { endpoint: string; keys: { p256dh: string; auth: string } }, { title, body, tag }))
    )

    return new Response(JSON.stringify({ sent: subs.length }), {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
