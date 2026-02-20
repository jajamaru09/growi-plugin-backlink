declare const growiFacade: any;

const activate = (): void => {
    if(growiFacade == null || growiFacade.markdownRenderer == null) {
        return;
    }
    
    // 実行したい処理
    console.log("[growi-plugin-backlink]: activate")
};

const deactivate = (): void => {
    // クリーンアップ処理（必要に応じて実装）
};

// `window.pluginActivators` オブジェクトへの登録
if ((window as any).pluginActivators == null) {
    (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-backlink'] = {
    activate,
    deactivate,
};