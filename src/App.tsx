import { AppProvider, useAppState } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import HomeTab from './tabs/HomeTab';
import EconomyTab from './tabs/EconomyTab';
import WikiTab from './tabs/WikiTab';
import ProfileTab from './tabs/ProfileTab';
import FormOverlay from './overlays/FormOverlay';
import ApprovalOverlay from './overlays/ApprovalOverlay';
import ConditionalOverlay from './overlays/ConditionalOverlay';
import TaskCreateOverlay from './overlays/TaskCreateOverlay';
import VoucherOverlay from './overlays/VoucherOverlay';
import WikiEditOverlay from './overlays/WikiEditOverlay';
import StatsOverlay from './overlays/StatsOverlay';
import './index.css';

function PhoneShell() {
  const { currentTab, overlay } = useAppState();

  return (
    <div className="w-full max-w-[400px] h-[850px] max-h-[90svh] bg-white shadow-2xl relative overflow-hidden flex flex-col rounded-[2.5rem] border-[8px] border-gray-900">

      {/* Tab content */}
      {currentTab === 'home' && <HomeTab />}
      {currentTab === 'economy' && <EconomyTab />}
      {currentTab === 'wiki' && <WikiTab />}
      {currentTab === 'profile' && <ProfileTab />}

      {/* Overlays */}
      {overlay === 'form' && <FormOverlay />}
      {overlay === 'approval' && <ApprovalOverlay />}
      {overlay === 'conditional' && <ConditionalOverlay />}
      {overlay === 'taskCreate' && <TaskCreateOverlay />}
      {overlay === 'voucher' && <VoucherOverlay />}
      {overlay === 'wikiEdit' && <WikiEditOverlay />}
      {(overlay === 'stats' || overlay === 'approvalHistory') && <StatsOverlay />}

      {/* Bottom nav (hidden when modal-style overlay) */}
      {overlay !== 'voucher' && overlay !== 'conditional' && overlay !== 'wikiEdit' && (
        <BottomNav />
      )}

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PhoneShell />
    </AppProvider>
  );
}
