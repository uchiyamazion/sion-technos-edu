# シオンテクノス 教育システム（Sion Technos Education）

冷凍・空調分野の原理と現場実務を、単元ごとのインタラクティブHTMLアプリで学べる教材集です。
各アプリはビルド不要の単一HTMLファイルで、ブラウザで開くだけで動作します。

## 構成

```
sion-technos-edu/
├── index.html                 ← 教材一覧のポータルページ
├── compression-cycle/
│   └── index.html              ← 冷凍サイクル（圧縮式）教材
├── absorption-cycle/
│   └── index.html              ← 冷凍サイクル（吸収式）教材（準備中）
└── README.md
```

## ローカルでの確認方法

リポジトリを clone またはダウンロードし、`index.html` をブラウザで直接開くだけで閲覧できます。
サーバーやビルドツールは不要です。

```bash
git clone https://github.com/<your-account>/sion-technos-edu.git
cd sion-technos-edu
open index.html   # Windowsの場合は start index.html
```

## GitHub Pagesでの公開

1. GitHubリポジトリの **Settings → Pages** を開く
2. Source を「Deploy from a branch」、Branch を `main` / フォルダを `/ (root)` に設定
3. 数分後、`https://<アカウント名>.github.io/sion-technos-edu/` で公開される

## 新しい教材を追加する手順

1. `sion-technos-edu/` 直下に新しいフォルダを作成する（例: `absorption-cycle/`）
2. その中に `index.html` を配置する（既存教材のデザイントークン・配色を踏襲すると統一感が出ます）
3. ルートの `index.html`（ポータルページ）にカードを追加し、リンクを張る
4. `git add . && git commit -m "add: 吸収式冷凍機の教材を追加" && git push`

## デザインの方針

- 背景: ネイビー系（`#0a1628`）＋放射状グラデーション
- アクセントカラー: 低圧・低温側＝シアン（`#5eead4`）／高圧・高温側＝オレンジ（`#fb923c`）／警告＝レッド（`#f43f5e`）
- フォント: 見出し「Zen Kaku Gothic New」／本文「Noto Sans JP」／数値・ラベル「JetBrains Mono」

## 監修

シオンテクノス株式会社
