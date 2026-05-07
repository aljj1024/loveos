import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, browser redirects to Google — no need to setLoading(false)
  }

  return (
    <div className="w-full h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl bg-white flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-[#D44545] via-[#B8862E] to-[#8B2E2E] px-6 pt-14 pb-20 text-center">
        <div className="text-5xl mb-3">💑</div>
        <h1 className="text-3xl font-black text-white">LoveOS</h1>
        <p className="text-[#F5E8C8] text-sm mt-2 font-medium">两个人的小朝廷</p>
      </div>

      <div className="flex-1 px-6 -mt-10 relative z-10 flex flex-col justify-start">
        <div className="bg-white rounded-[2rem] shadow-xl border-4 border-white p-6">
          <h2 className="font-black text-xl text-gray-800 mb-1">登录</h2>
          <p className="text-sm text-gray-400 font-medium mb-6">使用 Google 账号一键登录</p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform disabled:opacity-60 hover:border-[#D44545] hover:shadow-md"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-[#D44545]" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            {loading ? '跳转中...' : '使用 Google 登录'}
          </button>

          {error && <p className="text-[#D44545] text-xs font-bold mt-3 text-center">⚠️ {error}</p>}
        </div>

        <p className="text-center text-xs text-gray-300 mt-4 font-medium">
          登录即代表同意服务条款 · 不公开任何个人信息
        </p>
      </div>
    </div>
  )
}
