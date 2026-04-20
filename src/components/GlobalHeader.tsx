import { Bell, Trophy, LogOut } from 'lucide-react';
import { useAppState, useAppDispatch, useCurrentMood } from '../context/AppContext';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
}

export default function GlobalHeader({ title, subtitle }: GlobalHeaderProps) {
  const { points, wikiProfiles, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const currentMood = useCurrentMood();

  const profile = wikiProfiles.find(p => p.id === currentUser);

  return (
    <div className="bg-gradient-to-br from-rose-400 to-pink-500 pt-10 pb-6 px-6 text-white rounded-b-[2rem] shadow-md shadow-rose-200 z-10 relative">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-black tracking-wider drop-shadow-sm">{title}</h1>
          <p className="text-rose-100 text-sm mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform cursor-pointer"
            onClick={() => dispatch({ type: 'SHOW_TOAST', message: '没有新通知哦~' })}
          >
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs text-yellow-900 font-black w-4 h-4 rounded-full flex items-center justify-center border border-pink-500">
              1
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="bg-white/20 p-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform"
            title="切换身份"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/40 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              {profile?.avatar ?? '👤'}
            </div>
            <div className={`absolute -bottom-2 -right-2 ${currentMood.current.colorClass} text-white text-[10px] px-1.5 py-0.5 rounded-full border border-white font-bold flex items-center gap-1 whitespace-nowrap`}>
              <span>{currentMood.current.icon}</span>
              <span className="hidden sm:inline">{currentMood.current.text}</span>
            </div>
          </div>
          <div className="ml-2">
            <div className="font-bold text-lg leading-tight">{profile?.displayName ?? '加载中'}</div>
            <div className="text-xs bg-rose-500/50 px-2 py-1 rounded-full text-rose-50 flex items-center gap-1 mt-1.5 font-medium border border-rose-400/50">
              <Trophy size={12} className="text-yellow-300" />
              金库余额: {points} 币
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
