import { Clock } from 'lucide-react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { Modal, Button } from '../components/ui';

export default function VoucherOverlay() {
  const { vouchers, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const voucherId = overlayPayload?.voucherId as string;
  const voucher = vouchers.find((v) => v.id === voucherId);

  if (!voucher) return null;

  function close() {
    dispatch({ type: 'CLOSE_OVERLAY' });
  }

  function handleRequestRedeem() {
    dispatch({ type: 'REDEEM_VOUCHER', voucherId: voucher!.id });
    close();
    showToast('📣 已请核销，待对方圣允');
  }

  return (
    <Modal open onClose={close}>
      <div className="p-6 relative">
        {/* Voucher header */}
        <div className="text-center mb-5">
          <div className="text-6xl mb-2">{voucher.itemIcon}</div>
          <h2 className="font-bold text-lg text-ink-primary">{voucher.itemTitle}</h2>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            购于{' '}
            {new Date(voucher.purchasedAt).toLocaleString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Voucher body — dashed border ticket vibe */}
        <div className="border-2 border-dashed border-brand-accent rounded-button p-4 mb-5 bg-brand-accent-soft">
          <div className="flex items-center justify-between">
            <div className="text-xs text-brand-ink font-bold">恩诏编号</div>
            <div className="text-xs text-brand-ink font-mono font-bold tracking-wider">
              {voucher.id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div className="text-center mt-3">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-pill ${
                voucher.isRedeemed
                  ? 'bg-brand-soft text-ink-muted'
                  : voucher.pendingRedemption
                  ? 'bg-state-warning/20 text-state-warning'
                  : 'bg-brand text-ink-on-brand'
              }`}
            >
              {voucher.isRedeemed
                ? '已用'
                : voucher.pendingRedemption
                ? '待对方圣允'
                : '未用'}
            </span>
          </div>
        </div>

        {!voucher.isRedeemed && !voucher.pendingRedemption && (
          <Button fullWidth size="lg" onClick={handleRequestRedeem}>
            请核销 ✂️
          </Button>
        )}

        {voucher.pendingRedemption && (
          <div className="w-full bg-state-warning/15 border border-state-warning/30 rounded-button py-3 px-4 flex items-center justify-center gap-2">
            <Clock size={16} className="text-state-warning animate-pulse" />
            <span className="text-sm font-bold text-state-warning">恭候圣允中...</span>
          </div>
        )}

        {voucher.isRedeemed && (
          <Button fullWidth variant="secondary" onClick={close}>
            关闭
          </Button>
        )}
      </div>
    </Modal>
  );
}
