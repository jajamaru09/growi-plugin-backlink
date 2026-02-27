/**
 * client-entry.tsx — growi-plugin-backlink エントリーポイント
 *
 * GROWIはビルド後のこのファイルをブラウザでロードする。
 * window.pluginActivators に { activate, deactivate } を登録すると
 * GROWIがプラグインとして認識し、適切なタイミングで呼び出す。
 */

import { createPageChangeListener } from './src/growiNavigation';
import type { GrowiPageContext } from './src/pageContext';
import { mountOrUpdate, unmount } from './src/sidebarMount';

// ─── グローバル型宣言 ──────────────────────────────────────────────
declare global {
    interface Window {
        pluginActivators?: Record<string, { activate(): void; deactivate(): void }>;
    }
}

// ─── 定数 ────────────────────────────────────────────────────────
const PLUGIN_NAME = 'growi-plugin-backlink';

// ─── ページ遷移ハンドラ ───────────────────────────────────────────
/**
 * Navigation API がページID形式のURLへの遷移を検知したときに呼ばれる。
 * /admin や /me など非ページURLへの遷移では発火しない（growiNavigation.ts が除外）。
 *
 * @param ctx.pageId    - ページのURL（例: /6995d3fcf17c96c558f6b0ab）
 * @param ctx.mode      - 'view'（閲覧）または 'edit'（編集）
 * @param ctx.revisionId - 過去リビジョン表示時のみ存在。undefined なら最新版
 */
async function handlePageChange(ctx: GrowiPageContext): Promise<void> {
    if (ctx.mode === 'edit') {
        unmount();
        return;
    }

    // ctx.pageId は "/6995d3fcf17c96c558f6b0ab" 形式 → 先頭の / を除去
    mountOrUpdate(ctx.pageId.slice(1));
}

// ─── リスナーの生成 ───────────────────────────────────────────────
const { start, stop } = createPageChangeListener(handlePageChange);

// ─── プラグインライフサイクル ─────────────────────────────────────
function activate(): void {
    console.log(`[${PLUGIN_NAME}] activated`);
    start();
}

function deactivate(): void {
    console.log(`[${PLUGIN_NAME}] deactivated`);
    stop();
    unmount();
}

// ─── GROWI への自己登録 ───────────────────────────────────────────
if (window.pluginActivators == null) {
    window.pluginActivators = {};
}
window.pluginActivators[PLUGIN_NAME] = { activate, deactivate };
