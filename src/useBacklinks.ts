import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';
import { fetchPagePath, searchByKeyword } from './growiApi';

function mergeUnique(a: BacklinkPage[], b: BacklinkPage[]): BacklinkPage[] {
    const seen = new Set(a.map(p => p._id));
    return [...a, ...b.filter(p => !seen.has(p._id))];
}

/**
 * 指定した pageId（MongoDB ObjectId）のバックリンクを取得するカスタムフック。
 * pageId を検索ワードとして完全一致検索し、さらにページパスでも検索して結果をマージする。
 */
export function useBacklinks(pageId: string) {
    const [pages, setPages] = useState<BacklinkPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        setPages([]);

        async function fetchAll() {
            try {
                const pagePath = await fetchPagePath(pageId, controller.signal);

                const [byId, byPath] = await Promise.all([
                    searchByKeyword(pageId, controller.signal),
                    pagePath ? searchByKeyword(pagePath, controller.signal) : Promise.resolve([]),
                ]);

                const merged = mergeUnique(byId, byPath).filter(p => p._id !== pageId);
                setPages(merged);
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
