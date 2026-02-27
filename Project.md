# プロジェクト概要
- 今プロジェクトでは、OSS WikiツールのGrowiで閲覧中の記事を参照している記事（バックリンク）へのリンクをモーダルで表示するボタンをを画面右のside barにボタン形式で表示するプラグインを開発します
- Growiの画面遷移の検出にはpageContext.ts、growiNavagation.tsを使用します
- client-entry.tsxでhandlePageChangeが呼ばれたら、閲覧中のページのpageIdとpagePathを用いてapiを使用してバックリンクを取得します
- 外部の記事の中から閲覧中の記事を参照しているものを特定するのには2つの方法で検索をします
- 1つ目はpageIdを完全一致する文字列が、記事の本文中に存在している記事
- 2つ目は閲覧中の記事のpathに完全一致する文字列が、記事の本文中に存在している記事
- どちらも/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`; このAPIを使用します 完全一致の記事を取得するには検索ワードを""で囲みます
- 
- pagePathの取得にはこのAPIを使用します
    - /_api/v3/page?pageId=xxxxxxx。 page.pathでpathを取得できます



# 参考にするプロジェクト
実はすでにhttps://github.com/jajamaru09/growi-plugin-backlink-oldでバックリンクを表示する機能は作成済みです。
ページ遷移を検出するロジックが気に入らなかったため、ページ遷移の検出ロジックを指定した方法で行い、バックリンクの取得や表示の部分は既存プロジェクトをそのまま使用しましょう。

# ロジックの改善点
- /adminや/meなどのGrowiの記事以外のURLは処理をしなくてよいです。
- あくまでもhandlePageChangeが発火したときだけバックリンク取得、ボタン表示の処理を実行します


# 技術要件
- なるべく無駄な処理は省いてシンプルを目指す
- ReactのベストプラクティスやGrowiのベストプラクティスに従う

# 使用するAPI
- pageContextで使用できるのはpageIdおよびrevisionIdです。
- 概要でも説明しましたが、バックリンクを検索するのは/_api/search?q=${encodeURIComponent(`"${keyword}"`)}&limit=50`;
- 検索キーワードとなるpathを取得するのは/_api/v3/page?pageId=xxxxxxxです。

# ファイル構造の改善点
- growiApi.tsのようなファイルにAPI関数を分離
- sidebarMount.tsのようにマウントするための関数も分離
- buttonコンポーネントはsrc/componentに作成