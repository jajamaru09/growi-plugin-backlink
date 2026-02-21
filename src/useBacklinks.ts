import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';

// MongoDB ObjectId: 24文字の16進数
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

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
    if (!res.ok) return null; // 400 など非正常レスポンスは null として扱う
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
        // ルートページ（/）はスキップ
        if (!pageId) {
            setPages([]);
            setLoading(false);
            return;
        }

        // GROWI 内部ルート（/_search, /admin など）はAPIコールをスキップ
        if (pageId.startsWith('_') || pageId === 'admin' || pageId.startsWith('admin/')) {
            setPages([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        async function fetchAll() {
            try {
                let searchTermA = pageId; // URLから取得した値でそのまま検索
                let searchTermB: string | null = null; // もう一方の識別子で検索
                let selfId: string | null = null; // 自ページ除外用のObjectId

                if (OBJECT_ID_RE.test(pageId)) {
                    // URL が ObjectId 形式 → ページパスを取得して byPath 検索を追加
                    selfId = pageId;
                    const pageInfo = await fetchPage({ pageId }, controller.signal);
                    searchTermB = pageInfo?.path ?? null;
                } else {
                    // URL がパス形式 → ObjectId を取得して byId 検索を追加
                    const pageInfo = await fetchPage({ path: '/' + pageId }, controller.signal);
                    selfId = pageInfo?._id ?? null;
                    searchTermB = pageInfo?._id ?? null;
                }

                const [resultsA, resultsB] = await Promise.all([
                    searchByKeyword(searchTermA, controller.signal),
                    searchTermB != null
                        ? searchByKeyword(searchTermB, controller.signal)
                        : Promise.resolve([]),
                ]);

                const merged = mergeUnique(resultsA, resultsB);
                setPages(selfId != null ? merged.filter(p => p._id !== selfId) : merged);
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
