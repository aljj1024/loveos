import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, PlusCircle, Pencil, Lock } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import type { WishlistItem } from '../types';
import { Card, Button, Tab, Input, EmptyState } from '../components/ui';

const WISH_EMOJIS = ['🎁', '👜', '💄', '👟', '📱', '💍', '✈️', '🕯️', '🌸', '🍰'];

export default function WikiTab() {
  const { wikiProfiles, wishlist, currentUser } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const [activeProfileId, setActiveProfileId] = useState<'wife' | 'husband'>(currentUser ?? 'wife');
  const [addingWish, setAddingWish] = useState(false);
  const [wishName, setWishName] = useState('');
  const [wishEmoji, setWishEmoji] = useState('🎁');
  const [wishNotes, setWishNotes] = useState('');

  const wifeProfile = wikiProfiles.find((p) => p.id === 'wife');
  const husbandProfile = wikiProfiles.find((p) => p.id === 'husband');
  const activeProfile = activeProfileId === 'wife' ? wifeProfile : husbandProfile;
  const canEditProfile = activeProfileId === currentUser;

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
    showToast('✨ 已记于愿册');
  }

  function handleClaim(id: string) {
    dispatch({ type: 'CLAIM_WISHLIST_ITEM', id, claimedBy: currentUser ?? 'husband' });
    showToast('🎉 已暗中领命——给 TA 一个惊喜');
  }

  // Wishlist is now per-profile: each side owns their own.
  // Filter by activeProfileId; legacy items without addedBy default to wife.
  const visibleWishlist = wishlist.filter(
    (w) => (w.addedBy ?? 'wife') === activeProfileId
  );
  const isOwnProfile = activeProfileId === currentUser;
  const profileOwnerName = activeProfile?.displayName ?? (activeProfileId === 'wife' ? '老婆' : '老公');
  const wishlistTitle = isOwnProfile ? '朕的愿册' : `${profileOwnerName}的愿册`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto bg-bg-base pb-24"
    >
      <GlobalHeader title="档案" subtitle="记得细节，方得满分恩爱 📖" />

      <div className="px-5 py-5 space-y-5">
        {/* Profile switcher */}
        <div className="flex justify-center">
          <Tab<'wife' | 'husband'>
            items={[
              {
                id: 'wife',
                label: (
                  <span className="inline-flex items-center gap-1">
                    {wifeProfile?.avatar} {currentUser === 'wife' ? '我的档案' : 'TA 的档案'}
                  </span>
                ),
              },
              {
                id: 'husband',
                label: (
                  <span className="inline-flex items-center gap-1">
                    {husbandProfile?.avatar} {currentUser === 'husband' ? '我的档案' : 'TA 的档案'}
                  </span>
                ),
              },
            ]}
            value={activeProfileId}
            onChange={setActiveProfileId}
            layoutId="wiki-profile"
          />
        </div>

        {activeProfile && (
          <Card padding="lg" tone="surface" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-card text-xs font-bold bg-brand-soft text-brand-ink">
              {activeProfileId === 'wife' ? '👑' : '🐾'} {activeProfile.displayName}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{activeProfile.avatar}</div>
              <div>
                <h3 className="font-bold text-ink-primary">起居档案</h3>
                <p className="text-xs text-ink-muted">
                  {canEditProfile ? '点字段即改' : '仅供翻阅，不可改'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              {activeProfile.fields.map((field) => (
                <motion.button
                  key={field.key}
                  onClick={() => {
                    if (!canEditProfile) return;
                    dispatch({
                      type: 'OPEN_OVERLAY',
                      overlay: 'wikiEdit',
                      payload: { profileId: activeProfileId, fieldKey: field.key },
                    });
                  }}
                  disabled={!canEditProfile}
                  whileTap={canEditProfile ? { scale: 0.96 } : undefined}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  className={`text-left p-3 rounded-button group ${
                    field.colSpan === 2 ? 'col-span-2' : ''
                  } ${
                    field.highlight
                      ? 'bg-brand-accent-soft border border-brand-accent'
                      : 'bg-bg-base border border-line-subtle'
                  } ${canEditProfile ? 'cursor-pointer' : 'cursor-default opacity-90'}`}
                >
                  <span
                    className={`text-xs block mb-1 ${
                      field.highlight ? 'text-brand-ink' : 'text-ink-muted'
                    }`}
                  >
                    {field.label}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-bold text-sm ${
                        field.highlight ? 'text-brand-ink' : 'text-ink-primary'
                      }`}
                    >
                      {field.value}
                    </span>
                    {canEditProfile ? (
                      <Pencil size={12} className="text-ink-muted flex-shrink-0" />
                    ) : (
                      <Lock size={11} className="text-ink-muted flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-ink-primary font-bold flex items-center gap-2">
              <Gift size={18} className="text-brand-ink" /> {wishlistTitle}
            </h2>
            {isOwnProfile && (
              <button
                onClick={() => setAddingWish((v) => !v)}
                className="text-xs font-bold text-brand-ink flex items-center gap-1"
              >
                <PlusCircle size={14} /> 添一笔
              </button>
            )}
          </div>

          <AnimatePresence>
            {isOwnProfile && addingWish && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <Card padding="md" tone="accent" className="mb-3 border-brand-accent">
                  <div className="flex gap-2 mb-2.5 flex-wrap">
                    {WISH_EMOJIS.map((e) => (
                      <motion.button
                        key={e}
                        onClick={() => setWishEmoji(e)}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className={`w-9 h-9 text-xl rounded-button flex items-center justify-center ${
                          wishEmoji === e ? 'bg-brand-accent scale-110' : 'bg-bg-surface'
                        }`}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                  <Input
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder="心愿一笔..."
                    className="mb-2"
                  />
                  <Input
                    value={wishNotes}
                    onChange={(e) => setWishNotes(e.target.value)}
                    placeholder="备注（链接、颜色等）"
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      fullWidth
                      variant="secondary"
                      size="sm"
                      onClick={() => setAddingWish(false)}
                    >
                      取消
                    </Button>
                    <Button
                      fullWidth
                      size="sm"
                      onClick={handleAddWish}
                      disabled={!wishName.trim()}
                    >
                      记入 💝
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {visibleWishlist.length === 0 && !addingWish && (
            <Card padding="lg" tone="surface">
              <EmptyState
                icon="📝"
                title="愿册尚空"
                description={
                  isOwnProfile
                    ? '添第一笔吧'
                    : `${profileOwnerName} 尚未着墨`
                }
              />
            </Card>
          )}

          <div className="space-y-2.5">
            {visibleWishlist.map((item) => (
              <Card
                key={item.id}
                padding="md"
                tone="surface"
                className={`flex items-center justify-between ${
                  item.claimedBy ? 'opacity-70' : ''
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-11 h-11 bg-bg-base rounded-button flex items-center justify-center text-2xl">
                    {item.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-ink-primary text-sm">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-ink-muted mt-0.5">{item.notes}</div>
                    )}
                    {item.claimedBy && (
                      <div className="text-xs text-state-success font-bold mt-1">
                        ✅ 已暗中领命
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {!isOwnProfile && !item.claimedBy && (
                    <Button size="sm" onClick={() => handleClaim(item.id)}>
                      我来还愿
                    </Button>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'REMOVE_WISHLIST_ITEM', id: item.id });
                        showToast('🗑️ 已从愿册撤去');
                      }}
                      className="text-ink-muted text-xs font-bold hover:text-state-danger"
                    >
                      撤去
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
