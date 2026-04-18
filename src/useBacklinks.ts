import { useEffect, useState } from 'react';
import type { BacklinkPage } from './types';
import { fetchPagePath, searchByKeyword } from './growiApi';

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
    setLoading(true);
    setError(null);
    setPages([]);

    async function fetchAll() {
      try {
        let resolvedId = pageId;
        if (!pageId || pageId === '/') {
          const hub = (window as any).growiPluginHub;
          resolvedId = await hub.api.fetchPageIdByPath('/') ?? '';
        }

        const pagePath = await fetchPagePath(resolvedId, controller.signal);

        const [byId, byPath] = await Promise.all([
          searchByKeyword(resolvedId, controller.signal),
          pagePath ? searchByKeyword(pagePath, controller.signal) : Promise.resolve([]),
        ]);

        const merged = mergeUnique(byId, byPath).filter(p => p._id !== resolvedId);
        setPages(merged);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          setError('バッ��リンクの取得に失敗しました');
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
