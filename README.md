# growi-plugin-page-hook

**ページ遷移を検知するだけの、最小限のGROWIスクリプトプラグインです。**

このプラグイン自体は何かの処理を行いません。
「ページ遷移をフックして独自の処理を実行したい」プラグインのベースとして使うことを想定しています。

## このプラグインの使い方

このリポジトリをフォーク（またはコピー）し、[client-entry.tsx](client-entry.tsx) の `handlePageChange` 関数に処理を書くだけで、独自のページ遷移プラグインが作れます。ナビゲーション検知・重複発火防止・リビジョン判別などの基盤は変更不要です。

ページの閲覧・編集・過去リビジョン参照への遷移をすべて検知できます。

## 動作概要

ブラウザの [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API)（Chrome 102+）を使い、GROWIのSPA内ページ遷移を監視します。遷移先が記事ページ（24桁のMongoDBObjectId形式のURL）の場合にコールバックを呼び出します。

```
https://your-growi.example.com/6995d3fcf17c96c558f6b0ab           ← 最新版（view）
https://your-growi.example.com/6995d3fcf17c96c558f6b0ab#edit      ← 編集（edit）
https://your-growi.example.com/6995d3fcf17c96c558f6b0ab?revisionId=... ← 過去リビジョン
```

管理画面（`/admin`）や検索（`/_search`）などの非記事ページへの遷移は無視されます。

## ファイル構成

```
.
├── client-entry.tsx        # エントリーポイント。カスタムロジックはここに書く
├── src/
│   ├── growiNavigation.ts  # Navigation APIを使ったページ遷移監視ユーティリティ
│   └── pageContext.ts      # 型定義・URLユーティリティ
├── vite.config.ts          # Viteビルド設定
├── tsconfig.json           # TypeScript設定（ブラウザ向け）
└── tsconfig.node.json      # TypeScript設定（vite.config.ts向け）
```

## カスタマイズ方法

このリポジトリをフォークして、[client-entry.tsx](client-entry.tsx) の `handlePageChange` 関数だけを実装してください。それ以外のファイルは変更不要です。

```typescript
async function handlePageChange(ctx: GrowiPageContext): Promise<void> {
    // ctx.pageId    : ページのURL（例: /6995d3fcf17c96c558f6b0ab）
    // ctx.mode      : 'view'（閲覧）または 'edit'（編集）
    // ctx.revisionId: 過去リビジョンのID。最新版なら undefined

    // 例: 外部APIに通知する
    await fetch('/your-api', {
        method: 'POST',
        body: JSON.stringify(ctx),
        headers: { 'Content-Type': 'application/json' },
    });
}
```

`ctx.revisionId` の有無で最新版と過去リビジョンを区別できます。

```typescript
if (ctx.revisionId) {
    console.log('過去リビジョンを閲覧:', ctx.revisionId);
} else {
    console.log('最新版を閲覧:', ctx.pageId);
}
```

## セットアップ

### 依存パッケージのインストール

```bash
npm install
```

### ビルド

```bash
npm run build
```

`dist/` ディレクトリにビルド成果物が生成されます。

### ウォッチモード（開発時）

ファイルを保存するたびに自動でビルドされます。

```bash
npm run build:watch
```

### 型チェック

```bash
npx tsc --noEmit
```

## GROWIへのインストール

1. `npm run build` を実行して `dist/` を生成する
2. このリポジトリをGitHubなどに公開する
3. GROWIの管理画面 > プラグイン から、リポジトリのURLを入力してインストールする

GROWIはリポジトリ内の `package.json` の `growiPlugin` フィールドを参照してプラグインを認識します。

```json
"growiPlugin": {
    "schemaVersion": "4",
    "types": ["script"]
}
```

## 技術スタック

| ツール | 用途 |
|---|---|
| [TypeScript](https://www.typescriptlang.org/) | 型安全な実装 |
| [Vite](https://vitejs.dev/) | バンドル・ビルド |
| [@growi/pluginkit](https://www.npmjs.com/package/@growi/pluginkit) | GROWIプラグイン向けユーティリティ |
| Navigation API | SPA内ページ遷移の検知 |

## 注意事項

- Navigation API の対応ブラウザは以下の通りです。2026年1月に主要ブラウザすべてが対応し、[MDN では Baseline 2026](https://developer.mozilla.org/ja/docs/Web/API/Window/navigation) として掲載されています。

  | ブラウザ | 対応バージョン |
  |---|---|
  | Chrome | 102+ |
  | Edge | 102+ |
  | Firefox | 147+ |
  | Safari | 26.2+ |

  未対応ブラウザではリスナーが起動しないだけでエラーにはなりません。

- 同一ページ・同一モード・同一リビジョンへの重複遷移ではコールバックは発火しません。
