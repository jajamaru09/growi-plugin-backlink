import type { BacklinkPage } from './types';

/**
 * 指定キーワードの完全一致でページを検索し、最大50件を返す。
 * GROWI の /_api/search エンドポイントを使用する。
 */
export async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
    const url = `/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
    const res = await fetch(url, { credentials: 'same-origin', signal });
    const json = await res.json();
    if (!json.ok) return [];
    return (json.data as Array<{ data: BacklinkPage }>).map(item => item.data);
}

/**
 * pageId からページのパスを取得する。
 * GROWI の /_api/v3/page エンドポイントを使用する。
 */
export async function fetchPagePath(pageId: string, signal: AbortSignal): Promise<string | null> {
    const res = await fetch(`/_api/v3/page?pageId=${encodeURIComponent(pageId)}`, { credentials: 'same-origin', signal });
    if (!res.ok) return null;
    const json = await res.json();
    return json.page?.path ?? null;
}
