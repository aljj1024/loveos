import { useAppDispatch, useAppState } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { wikiProfiles, wifeMood, husbandMood } = useAppState();

  const wife = wikiProfiles.find(p => p.id === 'wife');
  const husband = wikiProfiles.find(p => p.id === 'husband');

  function login(role: UserRole) {
    dispatch({ type: 'LOGIN', role });
  }

  const roles = [
    { id: 'wife' as UserRole, profile: wife, mood: wifeMood, accent: 'rose', tagBg: 'bg-rose-100', tagText: 'text-rose-600', btnBg: 'from-rose-400 to-pink-500', shadow: 'shadow-rose-200' },
    { id: 'husband' as UserRole, profile: husband, mood: husbandMood, accent: 'blue', tagBg: 'bg-blue-100', tagText: 'text-blue-600', btnBg: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
  ];

  return (
    <div className="w-full h-[100svh] bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center px-8">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-3">💑</div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">LoveOS</h1>
        <p className="text-gray-400 text-sm font-medium mt-2">家庭联机生活系统</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {roles.map(({ id, profile, mood, tagBg, tagText, btnBg, shadow }) => (
          <button
            key={id}
            onClick={() => login(id)}
            className={`w-full bg-white rounded-3xl p-5 shadow-lg border-2 ${id === 'wife' ? 'border-rose-100' : 'border-blue-100'} flex items-center gap-5 active:scale-[0.98] transition-transform text-left`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-gray-100">
                {profile?.avatar}
              </div>
              <div className={`absolute -bottom-1.5 -right-1.5 ${mood.current.colorClass} text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white font-bold`}>
                {mood.current.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-lg text-gray-800">{profile?.displayName}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tagBg} ${tagText}`}>
                  {id === 'wife' ? '👑 主审' : '📝 申请人'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium truncate">
                当前状态：{mood.current.icon} {mood.current.text}
              </p>
            </div>
            <div className={`bg-gradient-to-br ${btnBg} text-white text-xs font-black px-4 py-2 rounded-xl shadow-md ${shadow} flex-shrink-0`}>
              进入 →
            </div>
          </button>
        ))}
      </div>

      <p className="text-gray-300 text-xs font-medium mt-10 text-center">
        数据存储在本设备 · 切换身份不会丢失数据
      </p>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-4 text-gray-300 text-xs font-medium hover:text-gray-400 transition-colors"
      >
        退出登录
      </button>
    </div>
  );
}
