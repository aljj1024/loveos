import { useState } from 'react';
import { Gift, PlusCircle, Pencil } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import type { WishlistItem } from '../types';

export default function WikiTab() {
  const { wikiProfiles, wishlist } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const [activeProfileId, setActiveProfileId] = useState<'wife' | 'husband'>('wife');
  const [addingWish, setAddingWish] = useState(false);
  const [wishName, setWishName] = useState('');
  const [wishEmoji, setWishEmoji] = useState('🎁');
  const [wishNotes, setWishNotes] = useState('');

  const wifeProfile = wikiProfiles.find(p => p.id === 'wife');
  const husbandProfile = wikiProfiles.find(p => p.id === 'husband');
  const activeProfile = activeProfileId === 'wife' ? wifeProfile : husbandProfile;

  function handleAddWish() {
    if (!wishName.trim()) return;
    const item: WishlistItem = {
      id: `wish_${Date.now()}`,
      name: wishName,
      emoji: wishEmoji,
      notes: wishNotes || undefined,
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_WISHLIST_ITEM', item });
    setWishName('');
    setWishNotes('');
    setWishEmoji('🎁');
    setAddingWish(false);
    showToast('✨ 已加入许愿池！');
  }

  function handleClaim(id: string) {
    dispatch({ type: 'CLAIM_WISHLIST_ITEM', id, claimedBy: 'husband' });
    showToast('🎉 已认领！准备给老婆一个惊喜吧');
  }

  const WISH_EMOJIS = ['🎁', '👜', '💄', '👟', '📱', '💍', '✈️', '🕯️', '🌸', '🍰'];

  return (
    <div className="flex-1 overflow-y-auto bg-orange-50/30 pb-24 animate-fade-in">
      <GlobalHeader title="共享外脑" subtitle="记住细节，才是满分爱情的秘诀 📖" />

      <div className="px-6 py-6 space-y-6">
        {/* Profile switcher */}
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {([
            { id: 'wife', profile: wifeProfile, accent: 'pink' },
            { id: 'husband', profile: husbandProfile, accent: 'blue' },
          ] as const).map(({ id, profile }) => (
            <button
              key={id}
              onClick={() => setActiveProfileId(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeProfileId === id
                  ? id === 'wife'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-base">{profile?.avatar}</span>
              <span>{profile?.displayName}</span>
            </button>
          ))}
        </div>

        {/* Active profile card */}
        {activeProfile && (
          <div className={`bg-white rounded-3xl p-5 shadow-sm border-2 relative overflow-hidden ${
            activeProfileId === 'wife' ? 'border-pink-100' : 'border-blue-100'
          }`}>
            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-xs font-bold ${
              activeProfileId === 'wife' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {activeProfileId === 'wife' ? '👑' : '🐾'} {activeProfile.displayName}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{activeProfile.avatar}</div>
              <div>
                <h3 className="font-black text-gray-800">基础档案</h3>
                <p className="text-xs text-gray-400">点击字段可编辑</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {activeProfile.fields.map(field => (
                <button
                  key={field.key}
                  onClick={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'wikiEdit', payload: { profileId: activeProfileId, fieldKey: field.key } })}
                  className={`text-left p-3 rounded-2xl active:scale-95 transition-transform group ${field.colSpan === 2 ? 'col-span-2' : ''} ${field.highlight ? 'bg-rose-50 border border-rose-100' : 'bg-gray-50'}`}
                >
                  <span className={`text-xs block mb-1 ${field.highlight ? 'text-rose-400' : 'text-gray-400'}`}>{field.label}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold text-sm ${field.highlight ? 'text-rose-800' : 'text-gray-700'}`}>{field.value}</span>
                    <Pencil size={12} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-gray-800 font-extrabold flex items-center gap-2">
              <Gift size={20} className="text-rose-500" /> 她的许愿池
            </h2>
            <button
              onClick={() => setAddingWish(!addingWish)}
              className="text-xs font-bold text-rose-400 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <PlusCircle size={14} /> 添加心愿
            </button>
          </div>

          {/* Add wish form */}
          {addingWish && (
            <div className="bg-rose-50 rounded-2xl p-4 mb-4 border-2 border-rose-200 animate-fade-in">
              <div className="flex gap-2 mb-3 flex-wrap">
                {WISH_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setWishEmoji(e)}
                    className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition-all ${wishEmoji === e ? 'bg-rose-200 scale-110' : 'bg-white'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={wishName}
                onChange={e => setWishName(e.target.value)}
                placeholder="心愿名称..."
                className="w-full bg-white rounded-xl px-4 py-2.5 text-sm font-medium border-0 outline-none mb-2"
              />
              <input
                type="text"
                value={wishNotes}
                onChange={e => setWishNotes(e.target.value)}
                placeholder="备注（链接、颜色等）"
                className="w-full bg-white rounded-xl px-4 py-2.5 text-sm font-medium border-0 outline-none mb-3"
              />
              <div className="flex gap-2">
                <button onClick={() => setAddingWish(false)} className="flex-1 bg-white text-gray-500 font-bold py-2 rounded-xl text-sm">
                  取消
                </button>
                <button
                  onClick={handleAddWish}
                  disabled={!wishName.trim()}
                  className="flex-1 bg-rose-500 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-40"
                >
                  加入 💝
                </button>
              </div>
            </div>
          )}

          {wishlist.length === 0 && !addingWish && (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-gray-100">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-gray-400 text-sm font-bold">许愿池是空的</p>
              <p className="text-gray-300 text-xs mt-1">添加第一个心愿吧</p>
            </div>
          )}

          <div className="space-y-3">
            {wishlist.map(item => (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-2xl border-2 flex items-center justify-between ${item.claimedBy ? 'border-green-100 opacity-70' : 'border-gray-100'}`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                    {item.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                    {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                    {item.claimedBy && (
                      <div className="text-xs text-green-500 font-bold mt-1">✅ 已被认领</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {!item.claimedBy && (
                    <button
                      onClick={() => handleClaim(item.id)}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform"
                    >
                      我来清空
                    </button>
                  )}
                  <button
                    onClick={() => {
                      dispatch({ type: 'REMOVE_WISHLIST_ITEM', id: item.id });
                      showToast('已从许愿池移除');
                    }}
                    className="text-gray-300 text-xs font-bold hover:text-gray-400"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
