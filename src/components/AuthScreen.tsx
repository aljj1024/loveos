import { useState } from 'react'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Step = 'email' | 'sent'

export default function AuthScreen() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    setError('')
    if (!email.includes('@')) {
      setError('请输入正确的邮箱地址')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('sent')
  }

  return (
    <div className="w-full h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-6 pt-14 pb-20 text-center">
        <div className="text-5xl mb-3">💑</div>
        <h1 className="text-3xl font-black text-white">LoveOS</h1>
        <p className="text-rose-100 text-sm mt-2 font-medium">两个人的专属操作系统</p>
      </div>

      <div className="flex-1 px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-white p-6">
          {step === 'email' ? (
            <>
              <h2 className="font-black text-xl text-gray-800 mb-1 flex items-center gap-2">
                <Mail size={20} className="text-rose-500" /> 邮箱登录
              </h2>
              <p className="text-sm text-gray-400 font-medium mb-5">输入邮箱，我们发一个登录链接给你</p>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-rose-300 transition-colors mb-4"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />

              {error && <p className="text-rose-500 text-xs font-bold mb-3">⚠️ {error}</p>}

              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-200 active:scale-95 transition-transform disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? '发送中...' : '发送登录链接'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                <h2 className="font-black text-xl text-gray-800 mb-2">邮件已发送！</h2>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  登录链接已发到：
                </p>
                <p className="text-sm font-black text-rose-500 mb-5">{email}</p>
                <p className="text-xs text-gray-400 font-medium">
                  打开邮件，点击链接即可登录。链接有效期 1 小时。
                </p>
              </div>

              <button
                onClick={() => { setStep('email'); setError('') }}
                className="w-full mt-2 text-xs font-bold text-gray-400 py-2 hover:text-rose-500 transition-colors"
              >
                重新输入邮箱
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-4 font-medium">
          登录即代表同意服务条款 · 不公开任何个人信息
        </p>
      </div>
    </div>
  )
}
