import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';

// パス形式での検索を有効にするか（将来的に無効化する可能性がある場合は false に）
const ENABLE_PATH_SEARCH = true;

async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
    const url = `/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
    const res = await fetch(url, { credentials: 'same-origin', signal });
    const json = await res.json();
    if (!json.ok) return [];
    return (json.data as Array<{ data: BacklinkPage }>).map(item => item.data);
}

async function fetchPagePath(pageId: string, signal: AbortSignal): Promise<string | null> {
    const res = await fetch(`/_api/v3/page?pageId=${pageId}`, { credentials: 'same-origin', signal });
    const json = await res.json();
    console.log('[backlink] page API response:', JSON.stringify(json).slice(0, 200));
    return json.path ?? json.data?.path ?? json.page?.path ?? null;
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
                const byId = await searchByKeyword(pageId, controller.signal);
                console.log('[backlink] byId:', byId);

                let results = byId;
                if (ENABLE_PATH_SEARCH) {
                    const path = await fetchPagePath(pageId, controller.signal);
                    console.log('[backlink] pagePath:', path);
                    if (path != null) {
                        const byPath = await searchByKeyword(path, controller.signal);
                        console.log('[backlink] byPath:', byPath);
                        results = mergeUnique(byId, byPath);
                    }
                }

                const filtered = results.filter(p => p._id !== pageId);
                console.log('[backlink] final pages:', filtered);
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
