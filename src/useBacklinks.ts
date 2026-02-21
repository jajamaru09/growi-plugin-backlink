import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';

async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
    const url = `/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
    const res = await fetch(url, { credentials: 'same-origin', signal });
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
        const controller = new AbortController();

        async function fetchAll() {
            try {
                // ルートページ（/）はURLにpageIdが含まれないため、パスでページ情報を取得してIDを解決する
                let effectivePageId = pageId;
                let resolvedPath: string | null = null;

                if (pageId === '') {
                    const rootPage = await fetchPage({ path: '/' }, controller.signal);
                    if (rootPage == null) {
                        setPages([]);
                        return;
                    }
                    effectivePageId = rootPage._id;
                    resolvedPath = rootPage.path;
                }

                // ID検索とpath取得を並列実行（ルートページはpath取得済みのためresolveのみ）
                const [byId, pagePath] = await Promise.all([
                    searchByKeyword(effectivePageId, controller.signal),
                    resolvedPath != null
                        ? Promise.resolve(resolvedPath)
                        : fetchPage({ pageId: effectivePageId }, controller.signal).then(p => p?.path ?? null),
                ]);

                let results = byId;
                if (pagePath != null) {
                    const byPath = await searchByKeyword(pagePath, controller.signal);
                    results = mergeUnique(byId, byPath);
                }

                const filtered = results.filter(p => p._id !== effectivePageId);
                setPages(filtered);
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
