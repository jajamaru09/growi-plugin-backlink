import { createRoot, type Root } from 'react-dom/client';
import BacklinkModal from './src/components/BacklinkModal';
import { useBacklinks } from './src/useBacklinks';
import { updateBadge } from './src/growiApi';
import type { PluginRegistration } from './src/hub-types';

const PLUGIN_NAME = 'growi-plugin-backlink';
const MODAL_MOUNT_ID = 'growi-plugin-backlink-modal-mount';

let modalRoot: Root | null = null;
let badgeAbort: AbortController | null = null;

function registerToHub(plugin: PluginRegistration): void {
  const hub = (window as any).growiPluginHub;
  if (hub?.register) {
    hub.register(plugin);
  } else {
    (window as any).growiPluginHub ??= { _queue: [] };
    (window as any).growiPluginHub._queue.push(plugin);
  }
}

function BacklinkApp({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const { pages, loading, error } = useBacklinks(pageId);
  return (
    <BacklinkModal pages={pages} loading={loading} error={error} onClose={onClose} />
  );
}

function showModal(rawPageId: string): void {
  const hub = (window as any).growiPluginHub;
  const pageId = hub.api.sanitizePageId(rawPageId);
  hub.log(PLUGIN_NAME, 'open modal, pageId:', pageId);

  cleanupModal();
  const el = document.createElement('div');
  el.id = MODAL_MOUNT_ID;
  document.body.appendChild(el);
  modalRoot = createRoot(el);

  const close = () => {
    modalRoot?.unmount();
    modalRoot = null;
    document.getElementById(MODAL_MOUNT_ID)?.remove();
  };

  modalRoot.render(<BacklinkApp pageId={pageId} onClose={close} />);
}

function cleanupModal(): void {
  modalRoot?.unmount();
  modalRoot = null;
  document.getElementById(MODAL_MOUNT_ID)?.remove();
}

function activate(): void {
  registerToHub({
    id: PLUGIN_NAME,
    label: 'バックリンク',
    icon: 'link',
    order: 10,
    badge: 0,
    onPageChange: (ctx) => {
      if (ctx.mode === 'edit') {
        cleanupModal();
        return;
      }
      const hub = (window as any).growiPluginHub;
      hub.log(PLUGIN_NAME, 'page change:', ctx.pageId);
      badgeAbort?.abort();
      badgeAbort = new AbortController();
      updateBadge(ctx.pageId, badgeAbort.signal);
    },
    onAction: (pageId) => showModal(pageId),
    onDisable: () => {
      cleanupModal();
      badgeAbort?.abort();
      badgeAbort = null;
    },
  });
}

function deactivate(): void {
  cleanupModal();
  (window as any).growiPluginHub?.unregister(PLUGIN_NAME);
}

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators[PLUGIN_NAME] = { activate, deactivate };
