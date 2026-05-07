import { useState } from 'react'
import { Copy, Check, ArrowRight, Loader2, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { createCouple, joinCouple } from '../lib/supabaseDb'

type Mode = 'choose' | 'create' | 'join'

interface Props {
  onComplete: (coupleId: string) => void
}

export default function CoupleSetup({ onComplete }: Props) {
  const [mode, setMode] = useState<Mode>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    setError('')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')
      const { inviteCode: code } = await createCouple(user.id)
      setInviteCode(code)
      setMode('create')
      // Don't call onComplete yet — wait for partner to join
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setError('')
    if (inputCode.trim().length < 6) {
      setError('请输入6位邀请码')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')
      const coupleId = await joinCouple(user.id, inputCode.trim())
      onComplete(coupleId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function checkIfPartnerJoined() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('couples')
      .select('id, user2_id')
      .eq('user1_id', user.id)
      .maybeSingle()
    if (data?.user2_id) {
      onComplete(data.id as string)
    } else {
      setError('伴侣还没有加入，请稍候再试')
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl bg-white flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-[#D44545] via-[#B8862E] to-[#8B2E2E] px-6 pt-14 pb-20 text-center">
        <div className="text-5xl mb-3">💌</div>
        <h1 className="text-3xl font-black text-white">邀请另一半临朝</h1>
        <p className="text-[#F5E8C8] text-sm mt-2 font-medium">结对后共理一国朝政</p>
      </div>

      <div className="flex-1 px-6 -mt-10 relative z-10 overflow-y-auto pb-8">
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-white p-6">

          {/* Choose mode */}
          {mode === 'choose' && (
            <>
              <h2 className="font-black text-lg text-gray-800 mb-5 text-center">你是开国君主，还是应邀临朝？</h2>
              <div className="space-y-3">
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full bg-[#D44545] text-white p-5 rounded-2xl font-black text-base flex items-center gap-4 shadow-md shadow-[#D44545]/30 active:scale-95 transition-transform disabled:opacity-60"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <span className="text-2xl">👑</span>}
                  <div className="text-left">
                    <div>我开国</div>
                    <div className="text-xs font-medium text-[#F5E8C8] mt-0.5">颁邀请码，召另一半临朝</div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('join')}
                  className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black text-base flex items-center gap-4 shadow-md active:scale-95 transition-transform"
                >
                  <span className="text-2xl">🔑</span>
                  <div className="text-left">
                    <div>我应召临朝</div>
                    <div className="text-xs font-medium text-gray-400 mt-0.5">输入对方颁的 6 位邀请码</div>
                  </div>
                </button>
              </div>
              {error && <p className="text-[#D44545] text-xs font-bold mt-3 text-center">⚠️ {error}</p>}
            </>
          )}

          {/* Created — show invite code, wait for partner */}
          {mode === 'create' && (
            <>
              <div className="text-center mb-5">
                <div className="text-3xl mb-2">🎉</div>
                <h2 className="font-black text-lg text-gray-800">专属邀请码</h2>
                <p className="text-sm text-gray-400 mt-1">将此码传给另一半</p>
              </div>

              <div
                onClick={copyCode}
                className="bg-[#FBE8E8] border-2 border-[#F4B8B8] rounded-2xl p-5 text-center cursor-pointer active:scale-95 transition-transform mb-5"
              >
                <div className="text-4xl font-black text-[#D44545] tracking-widest">{inviteCode}</div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-[#B83333]">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '已复制' : '点击复制'}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center font-medium mb-5">
                待另一半应召后，点下方临朝
              </p>

              <button
                onClick={checkIfPartnerJoined}
                className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Heart size={18} fill="currentColor" /> 另一半已临朝，进入！
              </button>

              {error && <p className="text-[#D44545] text-xs font-bold mt-3 text-center">⚠️ {error}</p>}
            </>
          )}

          {/* Join mode */}
          {mode === 'join' && (
            <>
              <button
                onClick={() => { setMode('choose'); setError('') }}
                className="text-xs font-bold text-gray-400 mb-4 flex items-center gap-1"
              >
                ← 返回
              </button>

              <h2 className="font-black text-xl text-gray-800 mb-1">应召临朝</h2>
              <p className="text-sm text-gray-400 mb-5 font-medium">请输入对方颁的 6 位邀请码</p>

              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-center text-2xl font-black text-gray-800 outline-none focus:border-[#D44545] transition-colors mb-4 tracking-widest"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />

              {error && <p className="text-[#D44545] text-xs font-bold mb-3">⚠️ {error}</p>}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-[#D44545] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#D44545]/30 active:scale-95 transition-transform disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? '结盟中...' : '临朝'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
