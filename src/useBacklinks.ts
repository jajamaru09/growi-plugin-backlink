import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';

async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
    const url = `/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
    const res = await fetch(url, { credentials: 'same-origin', signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.ok) return [];
    return (json.data as Array<{ data: BacklinkPage }>).map(item => item.data);
}

async function fetchPage(
    params: { pageId: string } | { path: string },
    signal: AbortSignal,
): Promise<{ _id: string; path: string } | null> {
    const query = 'pageId' in params
        ? `pageId=${encodeURIComponent(params.pageId)}`
        : `path=${encodeURIComponent(params.path)}`;
    const res = await fetch(`/_api/v3/page?${query}`, { credentials: 'same-origin', signal });
    if (!res.ok) return null;
    const json = await res.json();
    const page = json.page;
    if (page?._id == null || page?.path == null) return null;
    return { _id: page._id, path: page.path };
}

function mergeUnique(a: BacklinkPage[], b: BacklinkPage[]): BacklinkPage[] {
    const seen = new Set(a.map(p => p._id));
    return [...a, ...b.filter(p => !seen.has(p._id))];
}

export function useBacklinks(pageId: string) {
    const [pages, setPages] = useState<BacklinkPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // ルートページ（/）はURLにpageIdが含まれないためスキップ
        if (!pageId) {
            setPages([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function fetchAll() {
            try {
                // URLパス検索とpage._id取得を並列実行
                // URLはパス形式（例: "sandbox/test"）を前提とし、pathクエリでページ情報を取得する
                const [byPath, pageInfo] = await Promise.all([
                    searchByKeyword(pageId, controller.signal),
                    fetchPage({ path: '/' + pageId }, controller.signal),
                ]);

                // page._idでも検索してマージ（IDリンク形式のバックリンクを補足）
                let results = byPath;
                if (pageInfo != null) {
                    const byId = await searchByKeyword(pageInfo._id, controller.signal);
                    results = mergeUnique(byPath, byId);
                }

                // 自ページを除外
                const selfId = pageInfo?._id;
                setPages(selfId != null ? results.filter(p => p._id !== selfId) : results);
            } catch (e) {
                if (!(e instanceof DOMException && e.name === 'AbortError')) {
                    setError('バックリンクの取得に失敗しました');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
        return () => controller.abort();
    }, [pageId]);

    return { pages, loading, error };
}
