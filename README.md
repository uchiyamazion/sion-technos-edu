# シオンテクノス 教育システム（Sion Technos Education）

冷凍・空調・電気分野の原理と現場実務を、単元ごとのインタラクティブHTMLアプリで学べる教材集です。
各アプリはビルド不要の単一HTMLファイルで、ブラウザ（GitHub Pages等のWebサーバー経由）で開くだけで動作します。

## 構成

```
sion-technos-edu/
├── index.html                 ← 教材一覧のポータルページ（modules.jsonを読んで自動でカード生成）
├── modules.json                ← 教材一覧のメタデータ（単元を増やすときはここに追記するだけ）
├── shared/
│   ├── design-tokens.css       ← 共通の配色・フォント・カード/アコーディオン/クイズUI
│   └── components.js           ← アコーディオン開閉・クイズ進行/採点ロジック（SionQuizクラス）
├── compression-cycle/
│   └── index.html              ← 冷凍サイクル（圧縮式）教材
├── absorption-cycle/
│   └── index.html              ← 冷凍サイクル（吸収式）教材（準備中）
├── inverter-circuit/
│   └── index.html              ← 電気回路・インバーター教材（準備中）
└── README.md
```

## ローカルでの確認方法

ポータルページ（`index.html`）は `fetch('modules.json')` でJSONを読み込む都合上、
`file://` で直接開くとブラウザのセキュリティ制限で読み込めない場合があります。
ローカルで確認する場合は、リポジトリ直下で簡易サーバーを立てて開いてください。

```bash
git clone https://github.com/uchiyamazion/sion-technos-edu.git
cd sion-technos-edu
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

各単元フォルダ内の `index.html`（例: `compression-cycle/index.html`）は単体でも
`file://` で直接開いて動作します。

## GitHub Pagesでの公開

公開URL: **https://uchiyamazion.github.io/sion-technos-edu/**

設定変更が必要な場合は、リポジトリの **Settings → Pages** で
Source を「Deploy from a branch」、Branch を `main` / `/ (root)` にする。

## 新しい教材を追加する手順

1. `sion-technos-edu/` 直下に新しいフォルダを作成する（例: `inverter-circuit/`）
2. その中に `index.html` を配置する。`<head>` に以下を追加すると共通デザインが適用される：
   ```html
   <link rel="stylesheet" href="../shared/design-tokens.css">
   <script src="../shared/components.js"></script>
   ```
3. クイズを実装する場合は `SionQuiz` クラスを使う（`shared/components.js` 参照）。
   使い方の詳細はファイル冒頭のコメントを参照してください。
4. `modules.json` に1件追記する：
   ```json
   {
     "id": "inverter-circuit",
     "title": "電気回路・インバーター",
     "category": "電気",
     "status": "published",
     "levels": ["初級", "中級", "上級"],
     "description": "...",
     "path": "inverter-circuit/index.html"
   }
   ```
   `status` を `"coming-soon"` から `"published"` に変えるだけで、ポータルのカードが
   自動的に「公開中」表示・リンク付きに切り替わる。
5. `git add . && git commit -m "add: 電気回路・インバーター教材を追加" && git push`

新しい `category`（例: 「電気」「安全衛生」など）を指定すれば、ポータル側で
自動的にセクション見出しが分かれて表示される。

## デザインの方針

共通トークンは `shared/design-tokens.css` に集約している。個別教材のCSSでこれらの
値を直接書き直さず、極力このファイルの変数・クラスを再利用すること。

- 背景: ネイビー系（`#0a1628`）＋放射状グラデーション
- アクセントカラー: 低圧・低温側／正解＝シアン（`#5eead4`）／高圧・高温側＝オレンジ（`#fb923c`）／警告・不正解＝レッド（`#f43f5e`）／インタラクション＝ブルー（`#38bdf8`）
- フォント: 見出し「Zen Kaku Gothic New」／本文「Noto Sans JP」／数値・ラベル「JetBrains Mono」

## 監修

シオンテクノス株式会社
