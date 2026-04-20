import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast, useCurrentMood } from '../context/AppContext';
import { useMoodTimer } from '../hooks/useMoodTimer';
import { DEFAULT_MOODS } from '../constants';

export default function ProfileTab() {
  const { points, currentUser, wikiProfiles } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const currentMood = useCurrentMood();
  const moodCountdown = useMoodTimer();
  const [truceResult, setTruceResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const wifeProfile = wikiProfiles.find(p => p.id === 'wife');
  const husbandProfile = wikiProfiles.find(p => p.id === 'husband');
  const partnerName = currentUser === 'wife' ? (husbandProfile?.displayName ?? '老公') : (wifeProfile?.displayName ?? '老婆');

  const availableMoods = currentUser === 'husband'
    ? DEFAULT_MOODS.filter(m => m.id !== 'period')
    : DEFAULT_MOODS;

  function handleMoodSelect(m: typeof DEFAULT_MOODS[0]) {
    dispatch({ type: 'SET_MOOD', mood: m });
    showToast(`${m.icon} 状态已更新！已同步给${partnerName}`);
  }

  function handleTruce() {
    setIsSpinning(true);
    setTruceResult(null);
    setTimeout(() => {
      const wifeName = wifeProfile?.displayName ?? '老婆';
      const husbandName = husbandProfile?.displayName ?? '老公';
      const who = Math.random() > 0.5
        ? `${husbandName}先道歉 🙇‍♂️`
        : `${wifeName}先道歉 🙇‍♀️`;
      setTruceResult(who);
      setIsSpinning(false);
      showToast(`裁判结果：${who}`);
    }, 1500);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-24 animate-fade-in">
      <GlobalHeader title="个人中心" subtitle="随时更新状态，减少沟通摩擦 📡" />

      <div className="px-6 py-6 space-y-5">
        {/* 情绪气象台 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800 font-extrabold">今日情绪气象台</h2>
            <div className="text-xs text-gray-400 font-medium">{moodCountdown} 自动重置</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-bold mb-4">点击切换当前状态，对方会立即看到哦：</p>
            <div className="grid grid-cols-2 gap-3">
              {availableMoods.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m)}
                  className={`p-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                    currentMood.current.id === m.id
                      ? `${m.colorClass} text-white border-transparent shadow-md`
                      : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span> {m.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 赛博休战庭 */}
        <div className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm">
          <h3 className="font-extrabold text-gray-800 mb-1">🏳️ 赛博休战庭</h3>
          <p className="text-xs text-gray-400 font-medium mb-4">冷战了？让命运来决定谁先认错</p>

          <button
            onClick={handleTruce}
            disabled={isSpinning}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow-md shadow-rose-200 active:scale-95 transition-transform disabled:opacity-60"
          >
            {isSpinning ? '🎲 命运转动中...' : '一键破冰！抽签决定 🎲'}
          </button>

          {truceResult && (
            <div className="mt-4 bg-rose-50 rounded-2xl p-4 text-center border-2 border-rose-100 animate-scale-in">
              <div className="font-black text-lg text-rose-700">{truceResult}</div>
              <p className="text-xs text-rose-400 mt-1">裁判命令不可抗拒哦 ~</p>
            </div>
          )}
        </div>

        {/* 积分 & 数据 */}
        <div className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm">
          <h3 className="font-extrabold text-gray-800 mb-3">💰 家庭金库</h3>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-100 mb-3">
            <div className="text-3xl font-black text-yellow-600 text-center">{points}</div>
            <div className="text-xs text-yellow-500 font-bold text-center mt-1">当前余额（金库）</div>
          </div>
          <p className="text-xs text-gray-400 font-medium">去央行集市接任务赚取积分，或在心愿集市消费兑换特权！</p>
        </div>

        {/* Settings rows */}
        <div className="space-y-3">
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'stats', payload: { mode: 'stats' } })}
            className="w-full bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center text-sm font-bold text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>📊 历史表现数据</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
          <button
            onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'approvalHistory', payload: { mode: 'history' } })}
            className="w-full bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center text-sm font-bold text-gray-700 active:bg-gray-50 transition-colors"
          >
            <span>📜 审批历史记录</span>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
          <button
            onClick={() => {
              if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
                dispatch({ type: 'RESET_APP' });
                showToast('已重置所有数据');
              }
            }}
            className="w-full bg-white p-4 rounded-2xl border-2 border-gray-100 flex justify-between items-center text-sm font-bold text-red-400 active:bg-gray-50 transition-colors"
          >
            <span>🗑️ 重置所有数据</span>
            <ChevronRight size={18} className="text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
