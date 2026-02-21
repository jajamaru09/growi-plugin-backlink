import { createRoot } from 'react-dom/client';
import BacklinkButton from './src/BacklinkButton';

const MOUNT_ID = 'growi-plugin-backlink-mount';

const activate = (): void => {
    const pageListBtn = document.querySelector('[data-testid="pageListButton"]');
    if (pageListBtn == null) return;
    if (document.getElementById(MOUNT_ID) != null) return;

    const existingBtn = pageListBtn.querySelector('button');
    const cssModuleClass = Array.from(existingBtn?.classList ?? [])
        .find(cls => cls.startsWith('PageAccessoriesControl_btn-page-accessories__')) ?? '';

    const mountPoint = document.createElement('div');
    mountPoint.id = MOUNT_ID;
    pageListBtn.parentElement?.appendChild(mountPoint);

    const pageId = window.location.pathname.slice(1);
    createRoot(mountPoint).render(<BacklinkButton cssModuleClass={cssModuleClass} pageId={pageId} />);
};

const deactivate = (): void => {
    document.getElementById(MOUNT_ID)?.remove();
};

if ((window as any).pluginActivators == null) {
    (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-backlink'] = {
    activate,
    deactivate,
};
