import { Home, Store, BookHeart, UserCircle } from 'lucide-react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import type { TabId } from '../types';

const TABS: { id: TabId; icon: React.FC<{ size: number; strokeWidth: number }>; label: string }[] = [
  { id: 'home', icon: Home, label: '政务大厅' },
  { id: 'economy', icon: Store, label: '央行集市' },
  { id: 'wiki', icon: BookHeart, label: '共享外脑' },
  { id: 'profile', icon: UserCircle, label: '我的状态' },
];

export default function BottomNav() {
  const { currentTab } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-rose-50 flex justify-around py-3 px-2 pb-6 shadow-[0_-10px_30px_rgba(255,192,203,0.15)] z-30 rounded-b-[2.5rem]">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            className={`flex flex-col items-center transition-all duration-300 ${active ? 'text-rose-500 scale-110' : 'text-gray-400'}`}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
