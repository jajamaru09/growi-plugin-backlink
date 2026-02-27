import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import BacklinkButton from './components/BacklinkButton';

const MOUNT_ID = 'growi-plugin-backlink-mount';

let root: Root | null = null;

/** pageListButton または page-comment-button を含む親フレックスコンテナを返す */
function getContainer(): Element | null {
    const anchor =
        document.querySelector('[data-testid="pageListButton"]') ??
        document.querySelector('[data-testid="page-comment-button"]');
    return anchor?.parentElement ?? null;
}

/** 隣接ボタンから CSS Modules クラス名を動的に取得する */
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

/**
 * マウントポイントと React ルートを取得または新規作成して返す。
 * マウントポイントが DOM から消えていた場合（サイドバー再レンダリング時）は再生成する。
 */
function ensureRoot(container: Element): Root {
    const existing = document.getElementById(MOUNT_ID);
    if (existing && document.body.contains(existing) && root) {
        return root;
    }
    root?.unmount();
    const mountPoint = document.createElement('div');
    mountPoint.id = MOUNT_ID;
    container.appendChild(mountPoint);
    root = createRoot(mountPoint);
    return root;
}

/**
 * バックリンクボタンをサイドバーにマウント、または既存ルートを更新する。
 */
export function mountOrUpdate(pageId: string): void {
    const container = getContainer();
    if (!container) return;

    ensureRoot(container).render(<BacklinkButton pageId={pageId} cssModuleClass={getCssModuleClass()} />);
}

/** React ルートをアンマウントしてマウントポイントを削除する */
export function unmount(): void {
    root?.unmount();
    root = null;
    document.getElementById(MOUNT_ID)?.remove();
}
