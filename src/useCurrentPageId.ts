import { useEffect, useState } from 'react';

export function useCurrentPageId(): string {
    const [pageId, setPageId] = useState(() => window.location.pathname.slice(1));

    useEffect(() => {
        const update = () => setPageId(window.location.pathname.slice(1));

        window.addEventListener('popstate', update);

        // Next.js などの SPA ナビゲーションは pushState/replaceState を使うため直接インターセプトする
        const origPushState = history.pushState.bind(history);
        const origReplaceState = history.replaceState.bind(history);

        history.pushState = function (...args: Parameters<typeof history.pushState>) {
            origPushState(...args);
            update();
        };
        history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
            origReplaceState(...args);
            update();
        };

        return () => {
            window.removeEventListener('popstate', update);
            history.pushState = origPushState;
            history.replaceState = origReplaceState;
        };
    }, []);

    return pageId;
}
