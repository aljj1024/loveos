import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useAppState, useAppDispatch, useAuthState } from './context/AppContext'
import AuthScreen from './components/AuthScreen'
import CoupleSetup from './components/CoupleSetup'
import LoadingScreen from './components/LoadingScreen'
import LoginScreen from './components/LoginScreen'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import HomeTab from './tabs/HomeTab'
import EconomyTab from './tabs/EconomyTab'
import WikiTab from './tabs/WikiTab'
import ProfileTab from './tabs/ProfileTab'
import FormOverlay from './overlays/FormOverlay'
import ApprovalOverlay from './overlays/ApprovalOverlay'
import ConditionalOverlay from './overlays/ConditionalOverlay'
import TaskCreateOverlay from './overlays/TaskCreateOverlay'
import StoreItemCreateOverlay from './overlays/StoreItemCreateOverlay'
import VoucherOverlay from './overlays/VoucherOverlay'
import WikiEditOverlay from './overlays/WikiEditOverlay'
import StatsOverlay from './overlays/StatsOverlay'
import { isSupabaseConfigured, devBypassAuth } from './lib/supabase'
import { useDualTouchEasterEgg } from './hooks/useDualTouchEasterEgg'
import { Modal, Button } from './components/ui'
import './index.css'

function DevRoleSwitcher() {
  const { currentUser } = useAppState()
  const dispatch = useAppDispatch()
  if (!devBypassAuth) return null
  const next = currentUser === 'wife' ? 'husband' : 'wife'
  const nextLabel = next === 'wife' ? '🐱 老婆' : '🐶 老公'
  return (
    <button
      onClick={() => dispatch({ type: 'LOGIN', role: next })}
      className="absolute top-3 left-3 z-40 bg-bg-elevated/90 backdrop-blur text-ink-primary text-[10px] font-bold px-2.5 py-1 rounded-pill border border-line-subtle shadow-card"
      title="开发模式：切换身份"
    >
      DEV · 切到 {nextLabel}
    </button>
  )
}

function PhoneShell() {
  const { currentTab, overlay, flipMode } = useAppState()
  const dispatch = useAppDispatch()
  const shellRef = useRef<HTMLDivElement>(null)
  const [showEggDialog, setShowEggDialog] = useState(false)
  const [showRipple, setShowRipple] = useState(false)

  function unlockEasterEgg() {
    if (flipMode) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([30, 50, 30, 50, 80]) } catch { /* noop */ }
    }
    setShowRipple(true)
    setTimeout(() => setShowRipple(false), 900)
    dispatch({ type: 'TOGGLE_FLIP_MODE' })
    setShowEggDialog(true)
  }

  const eggProgress = useDualTouchEasterEgg(shellRef, unlockEasterEgg)

  // flipMode → root html class（驱动主色翻转）
  useEffect(() => {
    document.documentElement.classList.toggle('flip-mode', flipMode)
  }, [flipMode])

  // 24:00 自动复原
  useEffect(() => {
    if (!flipMode) return
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setHours(24, 0, 0, 0)
    const ms = Math.max(1000, tomorrow.getTime() - now.getTime())
    const t = setTimeout(() => dispatch({ type: 'TOGGLE_FLIP_MODE' }), ms)
    return () => clearTimeout(t)
  }, [flipMode, dispatch])

  // dev 后门：反引号键 ` 触发彩蛋（仅 devBypassAuth）
  useEffect(() => {
    if (!devBypassAuth) return
    function onKey(e: KeyboardEvent) {
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault()
        unlockEasterEgg()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipMode])

  return (
    <div
      ref={shellRef}
      className="w-full bg-bg-base text-ink-primary relative overflow-hidden flex flex-col h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-shell md:border-[6px] md:shadow-2xl"
      style={{
        backgroundImage: 'var(--pattern-paper)',
        backgroundSize: 'var(--pattern-size, 220px 220px)',
        borderColor: 'var(--wood-edge)',
      }}
    >
      <DevRoleSwitcher />

      {/* 双指按住时的渐显紫光蒙层 */}
      {eggProgress > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 z-[60] pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, rgba(167,139,250,${eggProgress * 0.45}) 0%, rgba(109,79,224,${eggProgress * 0.3}) 60%, transparent 100%)`,
            transition: 'opacity 0.05s linear',
          }}
        />
      )}

      {/* 触发涟漪 */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            aria-hidden
            key="ripple"
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 0, scale: 6 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 z-[55] pointer-events-none flex items-center justify-center"
          >
            <div
              className="w-24 h-24 rounded-pill"
              style={{
                background:
                  'radial-gradient(circle, rgba(167,139,250,0.85) 0%, rgba(109,79,224,0.4) 60%, transparent 80%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentTab === 'home' && <HomeTab />}
      {currentTab === 'economy' && <EconomyTab />}
      {currentTab === 'wiki' && <WikiTab />}
      {currentTab === 'profile' && <ProfileTab />}

      {overlay === 'form' && <FormOverlay />}
      {overlay === 'approval' && <ApprovalOverlay />}
      {overlay === 'conditional' && <ConditionalOverlay />}
      {overlay === 'taskCreate' && <TaskCreateOverlay />}
      {overlay === 'storeItemCreate' && <StoreItemCreateOverlay />}
      {overlay === 'voucher' && <VoucherOverlay />}
      {overlay === 'wikiEdit' && <WikiEditOverlay />}
      {(overlay === 'stats' || overlay === 'approvalHistory') && <StatsOverlay />}

      {overlay !== 'voucher' && overlay !== 'conditional' && overlay !== 'wikiEdit' && overlay !== 'storeItemCreate' && (
        <BottomNav />
      )}

      <Toast />

      {/* 彩蛋庆祝弹窗 */}
      <Modal open={showEggDialog} onClose={() => setShowEggDialog(false)}>
        <div className="px-6 pt-6 pb-5 text-center">
          <div
            className="text-5xl mb-3 leading-none select-none"
            style={{ color: '#6D4FE0', filter: 'drop-shadow(0 2px 6px rgba(167,139,250,0.5))' }}
          >
            ✦
          </div>
          <h2 className="text-lg font-bold mb-2 font-display tracking-wide text-ink-primary">
            今日权杖已倒置
          </h2>
          <div className="text-sm text-ink-secondary leading-relaxed mb-5">
            双指共同启印，结界翻转。<br />
            至 24:00 前，你们交换身份。
          </div>
          <Button fullWidth onClick={() => setShowEggDialog(false)}>
            收下了 ✦
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function AppInner() {
  const { session, coupleId, authLoading, setCoupleId } = useAuthState()
  const { currentUser } = useAppState()
  const dispatch = useAppDispatch()

  // Dev bypass: auto-login as wife if no user is set yet
  useEffect(() => {
    if (devBypassAuth && !currentUser) {
      dispatch({ type: 'LOGIN', role: 'wife' })
    }
  }, [currentUser, dispatch])

  if (devBypassAuth) {
    if (!currentUser) return <LoadingScreen />
    return <PhoneShell />
  }

  if (authLoading) return <LoadingScreen />
  if (isSupabaseConfigured && !session) return <AuthScreen />
  if (isSupabaseConfigured && session && !coupleId) {
    return <CoupleSetup onComplete={setCoupleId} />
  }
  if (!currentUser) return <LoginScreen />

  return <PhoneShell />
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
