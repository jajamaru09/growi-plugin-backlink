# growi-plugin-backlink

閲覧中の GROWI ページを参照している記事（バックリンク）をサイドバーのボタンから確認できるプラグインです。

## 機能

- 右サイドバーに **バックリンク** ボタンを表示
- ボタンをクリックするとバックリンク一覧をモーダルで表示
- ページ ID（MongoDB ObjectId）とページパスの両方で検索し、重複なくマージ
- 編集モード中はボタンを非表示

## 動作イメージ

```
サイドバー
┌──────────────────────┐
│ 📄 ページリスト      │
│ 💬 コメント          │
│ 🔗 バックリンク  [3] │  ← このプラグインが追加するボタン
└──────────────────────┘
```

## インストール

1. GROWI の管理画面 → **プラグイン** を開く
2. このリポジトリの URL を入力して登録
3. ページを再読み込みするとサイドバーにバックリンクボタンが表示されます

## 技術仕様

### 使用 API

| API | 用途 |
|---|---|
| `/_api/v3/page?pageId=<id>` | ページのパスを取得 |
| `/_api/search?q="<keyword>"&limit=50` | 完全一致でバックリンクを検索 |

### バックリンクの検索ロジック

1. 閲覧ページの **pageId**（ObjectId）を完全一致で検索
2. 閲覧ページの **pagePath** を完全一致で検索
3. 両結果を重複排除してマージし、自分自身を除外

### ページ遷移の検知

Navigation API（`window.navigation`）を使用して SPA のページ遷移を検知します。Chrome 102 以上が必要です。

## ファイル構成

```
client-entry.tsx          エントリーポイント・プラグインライフサイクル
src/
  growiNavigation.ts      Navigation API によるページ遷移検知
  pageContext.ts          ページ ID の型定義・URL 判定ユーティリティ
  growiApi.ts             GROWI API 呼び出し関数
  types.ts                共有型定義
  useBacklinks.ts         バックリンク取得カスタムフック
  sidebarMount.tsx        サイドバーへの React マウント管理
  components/
    BacklinkButton.tsx    バックリンクボタンコンポーネント
    BacklinkModal.tsx     バックリンクモーダルコンポーネント
```

## ライセンス

[MIT](./LICENSE)
