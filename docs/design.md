# 設計書

## 0. 概要

* **Frontend**: React 18 + Vite + TypeScript 5
* **State / Data**: TanStack Query（CSV fetch & cache）＋ PapaParse、Zustand（選手プール／履歴）
* **Visualization**: Chart.js 4（箱ひげ & ヒストグラム）
* **Simulation**: Web Worker (TypeScript) で Monte‑Carlo 実行  ▶︎ 将来 Rust→WASM に置換して高速化可能
* **Hosting / CI**: GitHub Pages + GitHub Actions

## 0.1 実装状況

**Phase 1 完了** (2025-07-24)
- ✅ **技術基盤**: Vite + React 18 + TypeScript 5 プロジェクト構築完了
- ✅ **開発環境**: ESLint, Prettier, 依存関係設定完了  
- ✅ **ディレクトリ構造**: src/components, hooks, worker 作成完了
- ✅ **動作確認**: 開発サーバー起動・ブラウザ表示確認済み
- ✅ **品質保証**: 型チェック・Lint・ビルドテスト通過

---

## 1. アーキテクチャ

### 技術スタック

| レイヤ      | 採用技術                                            | 役割                                                |
| -------- | ----------------------------------------------- | ------------------------------------------------- |
| データ取得    | **PapaParse**, **TanStack Query**               | Google Spreadsheet またはローカル CSV を取得し JSON 化／キャッシュ  |
| シミュレーション | **Web Worker (TS)**                             | 乱数で 9 回裏までを Monte‑Carlo, 9! 探索はヒューリスティック (1 か所入替) |
| UI       | **React 18**, **dnd‑kit**, **Zustand**          | 選手選択・打順編集・履歴表示 GUI                                |
| 可視化      | **Chart.js 4**                                  | 平均／分布グラフの描画                                       |
| ホスティング   | **GitHub Pages**                                | 静的 SPA 配信                                         |
| CI/CD    | **GitHub Actions** + peaceiris/actions‑gh‑pages | main へ push → build → gh‑pages デプロイ               |

### ディレクトリ構造（実装済み）

```
root/
├─ public/
│   └─ sample_players.csv   # ローカルテスト用
├─ src/
│   ├─ config.ts            # データソース切替 (env)
│   ├─ hooks/
│   │   └─ usePlayers.ts    # CSV fetch → Player[]
│   ├─ worker/
│   │   └─ simulator.ts     # Monte‑Carlo 実装
│   ├─ components/
│   │   ├─ PlayerTable.tsx
│   │   ├─ LineupEditor.tsx
│   │   └─ HistoryGrid.tsx
│   └─ ...
├─ config/                 # 設定ファイル群
│   ├─ tsconfig.json       # TypeScript設定
│   ├─ tsconfig.app.json   # アプリ用TypeScript設定
│   ├─ tsconfig.node.json  # Node.js用TypeScript設定
│   ├─ eslint.config.js    # ESLint設定
│   └─ vite.config.ts      # Vite設定
├─ data/                   # データファイル
│   └─ sample_players.csv  # ローカルテスト用
├─ docs/                   # プロジェクト文書
│   ├─ requirements.md     # 要件定義
│   ├─ design.md          # 設計書 (このファイル)
│   ├─ task.md            # 実装タスク
│   ├─ progress.md        # 進捗管理
│   └─ development_workflow.md
├─ reports/                # 進捗レポート格納
│   ├─ README.md
│   ├─ daily-report-template.md
│   └─ daily-report-YYYY-MM-DD-HHmmSS.md
├─ logs/                   # ログファイル
│   └─ server.log
└─ .github/
    └─ workflows/deploy.yml
```

---

## 2. データソース切替機構

| 項目                                                                                                                                                               | 設計                                 |                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------- |
| 切替方法                                                                                                                                                             | Vite 環境変数 \`VITE\_DATA\_MODE=local | remote` を参照し、`config.ts\` 内で URL を出し分ける |
| 変数定義                                                                                                                                                             | \`\`\`ts                           |                                         |
| export const CSV\_URL = import.meta.env.VITE\_DATA\_MODE === 'local'                                                                                             |                                    |                                         |
| ? '/sample\_players.csv'                                                                                                                                         |                                    |                                         |
| : '[https://docs.google.com/spreadsheets/d/xxxxxxxxxxxx/export?format=csv\&gid=0](https://docs.google.com/spreadsheets/d/xxxxxxxxxxxx/export?format=csv&gid=0)'; |                                    |                                         |

````|
| 想定運用 | **ローカル開発** → `.env.local` に `VITE_DATA_MODE=local` を記載<br>**GitHub Pages** → デフォルト `remote` を使用 |

---

## 3. テスト用サンプル CSV
`public/sample_players.csv` に以下ヘッダ＋ダミーデータを配置（生成スクリプトはこのリポジトリで自動生成）。
```csv
team,name,PA,1B,2B,3B,HR,SO,BB,OUT_OTHER
Giants,Sato Haruki,600,120,25,3,30,110,60,252
Giants,Tanaka Hiroto,550,105,18,1,24,90,55,257
Giants,Kobayashi Yuta,500,98,12,2,15,70,40,263
Giants,Yamada Kenta,450,85,20,1,12,80,42,210
Giants,Ikeda Shun,400,76,14,2,10,60,38,200
Tigers,Nakamura Ren,600,130,22,4,28,95,50,271
Tigers,Okada Riku,580,118,19,3,25,85,48,262
Tigers,Matsui Sora,520,101,17,1,18,75,41,267
Tigers,Suzuki Daiki,480,90,15,0,11,65,36,263
Tigers,Watanabe Kai,450,86,13,1,9,55,34,252
````

> ※ 列は team / name / 打席 (PA) / 単打～四球までのカウント / その他アウト。

---

## 4. シミュレーションエンジン

1. **確率テーブル作成**：各打席結果の累積分布を計算し `Float32Array` にキャッシュ。
2. **`atBat()`**：`Math.random()` → 2 分探索で打撃結果を決定。
3. **走者状態**：ビット列 (0b000–0b111) 管理、結果に応じてシフト。
4. **ゲームループ**：9 回、3 アウトで終了し総得点返却。
5. **ヒューリスティック**：初期打順から 1 打者 x 隔離距離を選び swap → 点数が改善すれば採用し履歴へ追加。終端条件=改善なし 10 回連続。

---

## 5. UI/UX設計

### 5.1 デザインシステム

**デザイン参考**: [Atlassian Design System](https://atlassian.design/components)

Atlassianのデザインシステムを参考にしたWebアプリケーションとして開発します。以下の要素を取り入れます：

#### デザイン原則
- **明確性**: ユーザーが直感的に理解できるインターフェース
- **効率性**: 最小限のクリックで目的を達成できる操作フロー
- **一貫性**: 統一されたスタイルガイドとコンポーネント設計
- **アクセシビリティ**: 幅広いユーザーが利用可能なUI

#### 採用コンポーネント
- **Button**: プライマリ・セカンダリ・デンジャーの明確な階層
- **Table**: ソート・フィルタリング機能付きデータテーブル
- **Select/Dropdown**: チーム選択等のプルダウンメニュー
- **Input**: URL入力・数値入力フィールド
- **Badge**: 選択状態・ステータス表示
- **Modal/Dialog**: 確認ダイアログ・設定画面
- **Loading**: データ取得時のスピナー表示
- **Toast**: 成功・エラーメッセージ通知

#### カラーパレット
- **Primary Blue**: #0052CC (メインアクション)
- **Success Green**: #00875A (成功状態)
- **Warning Orange**: #FF8B00 (注意喚起)
- **Danger Red**: #DE350B (エラー・削除)
- **Neutral**: #42526E (テキスト・ボーダー)

### 5.2 画面構成

| 画面   | コンポーネント           | 主な操作                           |
| ---- | ----------------- | ------------------------------ |
| 選手選択 | `PlayerTable`     | 球団プルダウン → 行クリックで 9 名選択         |
| 打順編集 | `LineupEditor`    | dnd‑kit で並び替え・削除               |
| シミュ  | `SimulationPanel` | 回数入力 (number / slider) → ▷ ボタン |
| 履歴   | `HistoryGrid`     | 打順・平均得点を時系列テーブルで表示             |

### 5.3 レスポンシブ対応

- **デスクトップ**: 1200px以上 - 左右分割レイアウト
- **タブレット**: 768px-1199px - 上下スタックレイアウト  
- **モバイル**: 767px以下 - 単一カラム・タブ切替

---

## 6. CI/CD

1. **lint & build**: `npm ci && npm run lint && npm run build` で静的チェック後 Vite build。
2. **deploy**: peaceiris/actions‑gh‑pages で `dist/` → `gh‑pages` に push。
3. **環境変数**: `REMOTE_CSV_URL` を repository secret に設定し、`VITE_DATA_MODE=remote` で公開ビルド。

