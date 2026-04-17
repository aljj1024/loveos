import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { useAppDispatch, useToast } from '../context/AppContext';
import { TASK_ICONS } from '../constants';
import type { Task } from '../types';

export default function TaskCreateOverlay() {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🧹');
  const [reward, setReward] = useState(50);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title,
      icon,
      reward,
      createdBy: 'wife',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_TASK', task: newTask });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast(`✅ 任务已发布！悬赏 ${reward} 积分`);
  }

  return (
    <div className="absolute inset-0 z-40 bg-white animate-slide-up flex flex-col h-full overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-md px-6 pt-10 pb-4 sticky top-0 z-10 border-b border-gray-100 flex items-center">
        <button onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })} className="text-gray-400 p-2 -ml-2">
          <XCircle size={26} />
        </button>
        <h1 className="text-xl font-black text-gray-800 ml-2">发布悬赏任务 💰</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">任务名称</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：今晚洗碗"
              className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-medium border-0 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">选择图标</label>
            <div className="flex flex-wrap gap-3">
              {TASK_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-11 h-11 text-2xl rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-rose-100 ring-2 ring-rose-400 scale-110' : 'bg-gray-50'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">
              悬赏积分: <span className="text-rose-500">{reward} 分</span>
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={reward}
              onChange={e => setReward(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
              <span>10</span><span>500</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-200">
          <p className="text-sm font-bold text-yellow-800">
            {icon} {title || '任务名称'} · 悬赏 <span className="text-yellow-600">{reward} 积分</span>
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          发布任务 🚀
        </button>
      </form>
    </div>
  );
}
