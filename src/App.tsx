import { useEffect } from 'react'
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
import VoucherOverlay from './overlays/VoucherOverlay'
import WikiEditOverlay from './overlays/WikiEditOverlay'
import StatsOverlay from './overlays/StatsOverlay'
import { isSupabaseConfigured, devBypassAuth } from './lib/supabase'
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
  const { currentTab, overlay } = useAppState()

  return (
    <div
      className="w-full bg-bg-base text-ink-primary relative overflow-hidden flex flex-col h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-shell md:border-[6px] md:border-line-strong md:shadow-2xl"
      style={{
        backgroundImage: 'var(--pattern-dots)',
        backgroundSize: 'var(--pattern-size, 18px 18px)',
      }}
    >

      <DevRoleSwitcher />

      {currentTab === 'home' && <HomeTab />}
      {currentTab === 'economy' && <EconomyTab />}
      {currentTab === 'wiki' && <WikiTab />}
      {currentTab === 'profile' && <ProfileTab />}

      {overlay === 'form' && <FormOverlay />}
      {overlay === 'approval' && <ApprovalOverlay />}
      {overlay === 'conditional' && <ConditionalOverlay />}
      {overlay === 'taskCreate' && <TaskCreateOverlay />}
      {overlay === 'voucher' && <VoucherOverlay />}
      {overlay === 'wikiEdit' && <WikiEditOverlay />}
      {(overlay === 'stats' || overlay === 'approvalHistory') && <StatsOverlay />}

      {overlay !== 'voucher' && overlay !== 'conditional' && overlay !== 'wikiEdit' && (
        <BottomNav />
      )}

      <Toast />
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
