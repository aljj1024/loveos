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
    <div className="w-full bg-white relative overflow-hidden flex flex-col h-[100svh] md:max-w-[400px] md:h-[850px] md:max-h-[90svh] md:rounded-[2.5rem] md:border-[8px] md:border-gray-900 md:shadow-2xl">

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
