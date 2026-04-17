import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';

export default function WikiEditOverlay() {
  const { wikiProfiles, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const profileId = overlayPayload?.profileId as 'wife' | 'husband';
  const fieldKey = overlayPayload?.fieldKey as string;

  const profile = wikiProfiles.find(p => p.id === profileId);
  const field = profile?.fields.find(f => f.key === fieldKey);

  const [value, setValue] = useState(field?.value ?? '');

  if (!field || !profile) return null;

  function handleSave() {
    dispatch({ type: 'UPDATE_PROFILE_FIELD', profileId, key: fieldKey, value });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('✅ 档案已更新！');
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end animate-fade-in">
      <div className="w-full bg-white rounded-t-[2rem] p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-gray-800">编辑 {field.label}</h2>
          <button onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })} className="text-gray-400">
            <XCircle size={26} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <textarea
            rows={3}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-gray-800 border-0 outline-none resize-none"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-rose-500 text-white font-black py-3 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            保存 💾
          </button>
        </div>
      </div>
    </div>
  );
}
