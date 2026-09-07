# ボウサイクル v2 — 2026-09-07

公開先は本人指定の `https://chiero.jp/bousaicle/`。既存の `kounkt/chiero` リポジトリの配下へViteの公開ビルドを配置する。DNS、メール、apexドメインのGitHub Pages設定は変更しない。

## 利用者向けの変更

- トップ画面で人数・日数から水と携帯トイレを試算。備蓄を使い始める導線と、災害時の公式情報を並置。
- 家にある数量と不足量を管理。優先品・不足品・買い物予定の絞り込み、品目検索、買い物メモのコピー。
- 準備率はS=3/A=2/B=1の重み付き数量充足率。端数切捨て。安全性の診断点数ではない。期限切れは除外し、期限未登録は数量のみ反映。
- 年月日の期限登録、1単位を使用した際の残量更新、確認予定のICS出力。年月のみの旧期限は月末を仮の基準と明記。
- 同じ種類のペットも頭数を入力。0人の世帯は作成不可。家族構成変更で実在庫を保持。
- 顔アイコンは切れていたface.webpから完全な元イラストの表示に変更。帽子・頬・あごの周囲に余白を残す。
- 家族シート、公式情報・web171への導線、保存失敗・オフライン表示、バックアップのサイズ制限とエラー案内。

## 数量と内容の根拠

確認日: 2026-09-07。根拠のある基準と、本アプリの初期目安を分けて表示する。

- 水: 1人1日3L（飲用・調理）。https://www.maff.go.jp/j/zyukyu/foodstock/imadoki/imadoki02_10.html
- 食品備蓄: 最低3日分〜1週間分。地域事情に応じた調整。https://www.maff.go.jp/j/zyukyu/foodstock/chapter01.html
- 携帯トイレ: 成人の1日平均排泄回数5回を基準。乳幼児はおむつ等で調整。https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html
- カセットボンベ: 1人1週間約6本。旧版の「2人で6本」は誤りで、2人7日分を12本に修正。https://www.maff.go.jp/j/zyukyu/foodstock/chapter07.html
- その他の品目・初期目安: https://www.maff.go.jp/j/zyukyu/foodstock/guidebook.html と https://www.bichiku.metro.tokyo.lg.jp/
- 171の操作・提供条件: https://www.ntt-east.co.jp/saigai/voice171/index.html

薬の備蓄量は医師・薬剤師に相談する案内とし、食の安全や避難先の安全をアプリで断定しない。未検証の行動科学の効果や「食べごろ」という期限通知表現を画面から除去。

## データの引き継ぎ

保存キー `bousaicle:v1` と外部スナップショットの世帯version=1を維持。ownedQtyとexpiry.dayは任意の追加項目。旧バックアップ・旧共有リンクを読める。旧版の「持っている」に実数は含まれないため、未確認と表示して数を入力するまで準備率に含めない。世帯変更・インポートでは最新の品目マスターへ対応付ける。

GitHubの旧URLとchiero.jpは別originなのでlocalStorageは共有できない。旧URLでも最新版を利用でき、同じ保存キーで以前のデータを読み込む。新URLへ移す場合は旧URLの設定からJSONを書き出して新URLの設定で取り込む。端末・ブラウザごとに必要。両方の設定画面に移行元・移行先を明記し、自動同期はないことを伝える。共有リンクは家族シートと買い物予定自由文を除外、JSONバックアップは含む。

## 配置と更新

1. `npm ci`、`npm test`、`npm run build`。
2. `node scripts/stage-release.mjs ../chiero_site`。公開ビルドだけを `bousaicle/` にコピーし、JP/ENサイトのアプリリンクとsitemapを更新する。コピー先CNAMEがchiero.jpであることを検証。
3. chiero側差分がアプリ配下と指定の5ファイルだけであることを確認。既存rootとCNAMEを維持。
4. 本人授権の範囲で公開し、Pages完了と公開HTML・主要assets・manifest・service workerのHTTPS応答を確認。
5. Service workerとmanifestは `/bousaicle/` に限定。サイト本体をnavigation fallbackの対象にしない。

2026-09-07の本人依頼により、過去に公開したリンクからも最新版を使えるよう、同じ公開ビルドを `kounkt/bousaicle` の `gh-pages` にも配置する。既存の親コミットと古いハッシュ付きassetsを保持し、`.nojekyll`も維持する。以後の公開ではchiero.jpと旧URLの両方を更新・照合する。canonicalとSNSの紹介リンクはchiero.jpに統一する。

新URLへの強制転送は旧ブラウザデータの取出しを妨げるため行わない。旧URLで備蓄管理を継続することも、新URLへバックアップで移すこともできる。

## 検証と制約

数量換算、部分在庫、世帯日数変更、期限日、ICS、旧バックアップ、共有プライバシー、不正入力を自動検証する。依存関係の既知問題を非破壊的な更新で解消。

ブラウザの機内モードでの実動作、スマホ実機のインストール・印刷の実品質は別途確認対象。バックアップがない状態でブラウザのデータを消すと復元できない。複数ロットの期限は一番近いものを1つ記録する構成であり、ロット別管理ではない。
