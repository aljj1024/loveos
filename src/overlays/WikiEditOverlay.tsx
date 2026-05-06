import { useState } from 'react';
import { useAppState, useAppDispatch, useToast } from '../context/AppContext';
import { Drawer, Button, Textarea } from '../components/ui';

export default function WikiEditOverlay() {
  const { wikiProfiles, overlayPayload } = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const profileId = overlayPayload?.profileId as 'wife' | 'husband';
  const fieldKey = overlayPayload?.fieldKey as string;

  const profile = wikiProfiles.find((p) => p.id === profileId);
  const field = profile?.fields.find((f) => f.key === fieldKey);

  const [value, setValue] = useState(field?.value ?? '');

  if (!field || !profile) return null;

  function close() {
    dispatch({ type: 'CLOSE_OVERLAY' });
  }

  function handleSave() {
    dispatch({ type: 'UPDATE_PROFILE_FIELD', profileId, key: fieldKey, value });
    close();
    showToast('✅ 档案已更新！');
  }

  return (
    <Drawer open onClose={close} side="bottom">
      <div className="p-5">
        <h2 className="font-bold text-lg text-ink-primary mb-3">编辑 {field.label}</h2>

        <Textarea
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="mb-3"
        />

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={close}>
            取消
          </Button>
          <Button fullWidth onClick={handleSave}>
            保存 💾
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
