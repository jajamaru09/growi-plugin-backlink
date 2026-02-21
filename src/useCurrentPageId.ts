import { useEffect, useState } from 'react';

// SPA遷移時に pushState へ渡されたURLがパーセントエンコード済みの場合があるため
// pathname を decode して正規化する（二重エンコード防止）
function getPageId(): string {
    try {
        return decodeURIComponent(window.location.pathname.slice(1));
    } catch {
        return window.location.pathname.slice(1);
    }
}

export function useCurrentPageId(): string {
    const [pageId, setPageId] = useState(getPageId);

    useEffect(() => {
        const update = () => setPageId(getPageId());

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
