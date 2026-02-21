import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import BacklinkButton from './src/BacklinkButton';

const MOUNT_ID = 'growi-plugin-backlink-mount';

let root: Root | null = null;
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 現在の URL がユーザーページかどうかを返す。
 * 管理画面（/admin）・検索（/_search）など GROWI 内部ルートでは false を返す。
 */
function isPageUrl(): boolean {
    try {
        const pathname = decodeURIComponent(window.location.pathname.slice(1));
        if (pathname.startsWith('_')) return false;         // /_search, /_api など
        if (pathname === 'admin' || pathname.startsWith('admin/')) return false;
        return true;
    } catch {
        return true;
    }
}

/** pageListButton を含むフレックスコンテナを返す。page-comment-button をフォールバックに使う */
function getContainer(): Element | null {
    const anchor =
        document.querySelector('[data-testid="pageListButton"]') ??
        document.querySelector('[data-testid="page-comment-button"]');
    return anchor?.parentElement ?? null;
}

/** 隣のボタンから CSS Modules クラス名を動的に取得する */
function getCssModuleClass(): string {
    const btn = document.querySelector<HTMLButtonElement>(
        '[data-testid="pageListButton"] button, [data-testid="page-comment-button"] button',
    );
    return (
        Array.from(btn?.classList ?? []).find(cls =>
            cls.startsWith('PageAccessoriesControl_btn-page-accessories__'),
        ) ?? ''
    );
}

/** React ルートを破棄して新しいコンテナにマウントし直す */
function mountButton(): void {
    const container = getContainer();
    if (container == null) return;

    root?.unmount();
    root = null;
    document.getElementById(MOUNT_ID)?.remove();

    const mountPoint = document.createElement('div');
    mountPoint.id = MOUNT_ID;
    container.appendChild(mountPoint);

    root = createRoot(mountPoint);
    root.render(<BacklinkButton cssModuleClass={getCssModuleClass()} />);
}

/**
 * 150ms のデバウンスでボタンの存在を確認し、
 * 消えていれば再マウントする。
 * MutationObserver・SPA ナビゲーション・activate() の初回呼び出しで共用。
 */
function scheduleCheck(): void {
    if (debounceTimer != null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        if (!isPageUrl()) {
            // 管理画面・検索など非ページURLではボタンを削除
            root?.unmount();
            root = null;
            document.getElementById(MOUNT_ID)?.remove();
            return;
        }
        const container = getContainer();
        if (container == null) return; // サイドバーがまだ描画されていない
        if (document.getElementById(MOUNT_ID) == null) {
            mountButton();
        }
    }, 150);
}

const activate = (): void => {
    // 初回マウントを試みる（サイドバーが未描画なら scheduleCheck 内で待機）
    scheduleCheck();

    // サイドバーの再描画（ページ遷移時の React ツリー差し替えなど）を監視する
    observer = new MutationObserver(scheduleCheck);
    observer.observe(document.body, { childList: true, subtree: true });
};

const deactivate = (): void => {
    if (debounceTimer != null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    observer?.disconnect();
    observer = null;
    root?.unmount();
    root = null;
    document.getElementById(MOUNT_ID)?.remove();
};

if ((window as any).pluginActivators == null) {
    (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-backlink'] = {
    activate,
    deactivate,
};
