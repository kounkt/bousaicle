# 07. 技術選定・アーキテクチャ

## 方針

「サーバーを持たない」が最重要の設計判断。理由:
1. プライバシー(個人データを預からない=信頼の核、法的リスク最小)
2. 災害時のアクセススパイクに静的CDNは強い
3. 個人開発の運用コストをゼロ近傍に(無料公開を持続可能にする)

## スタック決定

| レイヤ | 採用 | 理由 |
|---|---|---|
| ビルド | **Vite** | 標準的・高速・PWAプラグインが成熟 |
| UI | **React 18 + TypeScript** | 状態の多いチェックリストUIに適合。情報量・AI支援も最多 |
| スタイル | **Tailwind CSS v4** | デザイントークン(ブランド色)を設定に集約。CSS肥大を防ぐ |
| 状態管理 | **Zustand + persist(localStorage)** | 小さい・localStorage同期が一級市民。Reduxは過剰 |
| バリデーション | **zod** | localStorage/共有URLから読むデータのスキーマ検証+マイグレーション |
| 共有URL圧縮 | **lz-string**(URLハッシュ) | サーバーなしで状態共有を実現 |
| 画像生成 | **Canvas API**(直書き) | シェア画像・シートPNG。html2canvasは重く崩れやすいので避け、シェア画像は専用Canvas描画 |
| 印刷 | print CSS(@media print) | 冷蔵庫シートはDOM+印刷CSSで(PNG化もCanvasでなくこのDOMを基準に) |
| ICS生成 | 自前生成(RFC 5545は単純) | 依存を増やさない。Googleカレンダーはrender URLリンク |
| テスト | **Vitest**(計算ロジック)+ Playwright(主要フロー1本) | 備蓄量計算は全分岐をユニットテストで担保(正確性=信頼) |
| ホスティング | **Cloudflare Pages** | 無料・独自ドメイン・グローバルCDN・帯域無制限(GitHub Pagesは帯域ソフト制限があり災害時スパイクに不安) |
| 解析 | **Cloudflare Web Analytics** | クッキーレス・無料・同意バナー不要。GA4は使わない(プライバシー方針と矛盾) |
| CI/CD | GitHub Actions → Pages 自動デプロイ | main へのpushで本番、PRでプレビューURL |

PWA(v1.1): `vite-plugin-pwa` で追加。MVPではmanifest+アイコンだけ先に入れておく。

## アーキテクチャ図

```
[ユーザーのブラウザ]
  ├─ React SPA(静的配信)
  ├─ localStorage("bousaicle:v1")… 全ユーザーデータ
  ├─ Canvas → シェア画像 / シートPNG(ローカル生成・送信なし)
  └─ .ics ダウンロード → ユーザーのカレンダーアプリ
        ↑ 配信のみ
[Cloudflare Pages + CDN] ← GitHub Actions ← GitHub repo
外部リンク(データは渡さない): ハザードマップポータル / 東京備蓄ナビ / 171解説
```

サーバーサイド処理: **ゼロ**。フォーム送信先も問い合わせフォームも持たない(問い合わせはGitHub Issues or SNS)。

## リポジトリ構成

```
bousaicle/
├─ docs/                  # 本企画ドキュメント(このまま移設)
├─ public/                #  チエロ画像、favicon、manifest
├─ src/
│  ├─ data/
│  │  └─ stock-master.ts  # 品目マスタ+計算係数(全行に出典コメント)
│  ├─ logic/
│  │  ├─ calc.ts          # 備蓄量計算(純関数・全分岐テスト)
│  │  ├─ score.ts         # そなえスコア
│  │  ├─ ics.ts           # ICS生成
│  │  └─ share.ts         # lz-string 圧縮/展開+zod検証
│  ├─ store/              # Zustand(persist, migrate)
│  ├─ screens/            # S0〜S6(ルートは hash router or wouter)
│  ├─ components/         # Chiero(吹き出し), ScoreBadge, ItemRow, ...
│  └─ styles/
├─ tests/
└─ .github/workflows/deploy.yml
```

## 重要な実装ノート

- **スキーマバージョニング**: `AppState.version` を必ず持ち、`migrate(old) → new` を store 初期化に組み込む。公開後にスキーマを変えても既存ユーザーのデータを壊さない
- **計算ロジックはUIから完全分離**(純関数)。数量基準の年次見直し時に `stock-master.ts` の差し替えだけで済むように
- **共有URLの安全性**: 受信側は必ずzodで検証し、「コピーして取り込む」確認を挟む(他人のリンクで自分のデータが黙って上書きされない)
- **シェア画像に個人情報を入れない**: スコア・日数・チエロのみ。家族構成・地域は載せない
- **バンドル予算**: 初回JS 150KB(gzip)。チエロ画像はWebP+遅延読み込み、ポーズ画像はスプライトかページ別分割
- **エラー監視**: Sentry等は入れない(プライバシー方針優先)。window.onerror でローカル表示+「報告する」ボタンでGitHub Issue雛形を開くに留める

## ドメイン・URL

- 候補: `bousaicle.com` / `bousaicle.app` / `sonae.chiero.jp` 系(チエロのサイトがあるならサブドメイン)
- 取得は名称確定後(08の公開前チェックと同時)。Cloudflare Registrar で取得すると管理が一元化できる
