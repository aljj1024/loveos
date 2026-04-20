import { XCircle, Clock } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';

export default function VoucherOverlay() {
  const { vouchers, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const voucherId = overlayPayload?.voucherId as string;
  const voucher = vouchers.find(v => v.id === voucherId);

  if (!voucher) return null;

  function handleRequestRedeem() {
    dispatch({ type: 'REDEEM_VOUCHER', voucherId: voucher!.id });
    dispatch({ type: 'CLOSE_OVERLAY' });
    showToast('📣 已申请核销，等待对方确认！');
  }

  return (
    <div className="absolute inset-0 z-40 bg-black/50 flex items-center justify-center animate-fade-in px-6">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-[320px] animate-scale-in relative">
        <button
          onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          className="absolute top-4 right-4 text-gray-300"
        >
          <XCircle size={24} />
        </button>

        {/* Voucher card */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{voucher.itemIcon}</div>
          <h2 className="font-black text-xl text-gray-800">{voucher.itemTitle}</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            购于 {new Date(voucher.purchasedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Decorative voucher border */}
        <div className="border-2 border-dashed border-rose-200 rounded-2xl p-4 mb-6 bg-rose-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-rose-400 font-bold">凭证编号</div>
            <div className="text-xs text-rose-600 font-mono font-bold">
              {voucher.id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div className="text-center mt-3">
            <span className={`text-sm font-black px-3 py-1 rounded-full ${
              voucher.isRedeemed
                ? 'bg-gray-200 text-gray-500'
                : voucher.pendingRedemption
                ? 'bg-orange-100 text-orange-500'
                : 'bg-rose-500 text-white'
            }`}>
              {voucher.isRedeemed ? '已使用' : voucher.pendingRedemption ? '待对方确认' : '未使用'}
            </span>
          </div>
        </div>

        {!voucher.isRedeemed && !voucher.pendingRedemption && (
          <button
            onClick={handleRequestRedeem}
            className="w-full bg-rose-500 text-white font-black py-3 rounded-2xl shadow-md shadow-rose-200 active:scale-95 transition-transform"
          >
            申请核销 ✂️
          </button>
        )}

        {voucher.pendingRedemption && (
          <div className="w-full bg-orange-50 border-2 border-orange-200 rounded-2xl py-3 px-4 flex items-center justify-center gap-2">
            <Clock size={16} className="text-orange-400 animate-pulse" />
            <span className="text-sm font-black text-orange-500">等待对方确认中...</span>
          </div>
        )}

        {voucher.isRedeemed && (
          <button
            onClick={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            className="w-full bg-gray-100 text-gray-500 font-black py-3 rounded-2xl"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
}
