declare const growiFacade: any;

const MOUNT_ID = 'growi-plugin-backlink-mount';

const BacklinkButton = () => (
    <div className="d-flex">
        <button
            type="button"
            className="btn btn-outline-neutral-secondary rounded-pill py-1 px-lg-3"
            onClick={() => console.log('[growi-plugin-backlink]: clicked')}
        >
            <span className="grw-icon d-flex me-lg-2">
                <span className="material-symbols-outlined">link</span>
            </span>
            <span className="grw-labels d-none d-lg-flex">バックリンク</span>
        </button>
    </div>
);

const activate = (): void => {
    if (growiFacade?.reactFactory == null) return;

    const observer = new MutationObserver(() => {
        const pageListBtn = document.querySelector('[data-testid="pageListButton"]');
        if (pageListBtn == null) return;
        if (document.getElementById(MOUNT_ID) != null) return; // 重複防止

        observer.disconnect();

        const mountPoint = document.createElement('div');
        mountPoint.id = MOUNT_ID;
        pageListBtn.parentElement?.appendChild(mountPoint);

        growiFacade.reactFactory.renderToDOM(<BacklinkButton />, mountPoint);
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

const deactivate = (): void => {
    const mountPoint = document.getElementById(MOUNT_ID);
    if (mountPoint != null) {
        growiFacade?.reactFactory?.unmountFromDOM?.(mountPoint);
        mountPoint.remove();
    }
};

if ((window as any).pluginActivators == null) {
    (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-backlink'] = {
    activate,
    deactivate,
};
