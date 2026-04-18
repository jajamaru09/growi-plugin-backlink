/**
 * growiApi.ts — バックリンク固有API
 *
 * 共通API（fetchPageIdByPath, searchPages, fetchPageInfo等）は extension-hub が提供する。
 * このファイルにはバッジ更新など本プラグイン固有のロジックを残す。
 */

import type { BacklinkPage } from './types';

const PLUGIN_NAME = 'growi-plugin-backlink';

function getHub(): any {
  return (window as any).growiPluginHub;
}

/**
 * 指定キーワードの完全一致でページを検索し、最大50件を返す。
 * hub.api.searchPages を使用する。
 */
export async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
  const hub = getHub();
  return hub.api.searchPages(keyword, signal);
}

/**
 * pageId からページのパスを取得する。
 * hub.api.fetchPageInfo を使用する。
 */
export async function fetchPagePath(pageId: string, signal: AbortSignal): Promise<string | null> {
  const hub = getHub();
  const info = await hub.api.fetchPageInfo(pageId, signal);
  return info?.path ?? null;
}

/**
 * バッジ（バックリンク件数）を更新する。
 * signal を渡すことで、ページ遷移時に前回のリクエストをキャンセルできる。
 */
export async function updateBadge(rawPageId: string, signal: AbortSignal): Promise<void> {
  const hub = getHub();
  const pageId = hub.api.sanitizePageId(rawPageId);

  try {
    const [byId, pagePath] = await Promise.all([
      searchByKeyword(pageId, signal),
      fetchPagePath(pageId, signal),
    ]);
    const byPath = pagePath
      ? await searchByKeyword(pagePath, signal)
      : [];

    if (signal.aborted) return;

    const seen = new Set(byId.map((p: BacklinkPage) => p._id));
    const merged = [...byId, ...byPath.filter((p: BacklinkPage) => !seen.has(p._id))];
    const count = merged.filter((p: BacklinkPage) => p._id !== pageId).length;

    hub.log(PLUGIN_NAME, 'badge count:', count);
    hub.updateBadge(PLUGIN_NAME, count || null);
  } catch {
    // badge update failure or abort is non-critical
  }
}
