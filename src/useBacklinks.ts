import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';

// パス形式での検索を有効にするか（将来的に無効化する可能性がある場合は false に）
const ENABLE_PATH_SEARCH = true;

async function searchByKeyword(keyword: string, signal: AbortSignal): Promise<BacklinkPage[]> {
    const url = `/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
    const res = await fetch(url, { credentials: 'same-origin', signal });
    const json = await res.json();
    if (!json.ok) return [];
    return json.data as BacklinkPage[];
}

async function fetchPagePath(pageId: string, signal: AbortSignal): Promise<string | null> {
    const res = await fetch(`/_api/v3/page?pageId=${pageId}`, { credentials: 'same-origin', signal });
    const json = await res.json();
    return json.path ?? null;
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

                let results = byId;
                if (ENABLE_PATH_SEARCH) {
                    const path = await fetchPagePath(pageId, controller.signal);
                    if (path != null) {
                        const byPath = await searchByKeyword(path, controller.signal);
                        results = mergeUnique(byId, byPath);
                    }
                }

                setPages(results.filter(p => p._id !== pageId));
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
