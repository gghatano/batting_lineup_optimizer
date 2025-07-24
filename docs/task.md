# 実装タスク

## プロジェクト概要

Google Spreadsheetから取得した打撃成績を基に、ブラウザ上で9人の打順をヒューリスティック最適化し、シミュレーションによる平均得点を可視化するWebアプリを提供する。

### 主要機能
- 12球団から選手を選択し、9名の打順をドラッグ&ドロップで編集
- Monte-Carloシミュレーションによる試合結果の統計分析
- ヒューリスティック探索による最適打順の自動探索
- Chart.jsを使った得点分布の可視化

## アーキテクチャ

### 技術スタック
- **Frontend**: React 18 + Vite + TypeScript 5
- **State Management**: TanStack Query (CSV fetch & cache) + Zustand (選手プール・履歴)
- **Data Processing**: PapaParse (CSV parsing)
- **Simulation**: Web Worker (TypeScript) でMonte-Carlo実行
- **Visualization**: Chart.js 4 (箱ひげ図・ヒストグラム)
- **Hosting**: GitHub Pages + GitHub Actions

### ディレクトリ構成
```
root/
├─ public/
│   └─ vite.svg            # アイコン
├─ src/
│   ├─ config.ts           # データソース切替 (env)
│   ├─ hooks/
│   │   └─ usePlayers.ts   # CSV fetch → Player[]
│   ├─ worker/
│   │   └─ simulator.ts    # Monte-Carlo実装
│   ├─ components/
│   │   ├─ PlayerTable.tsx
│   │   ├─ LineupEditor.tsx
│   │   └─ HistoryGrid.tsx
│   └─ ...
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
│   ├─ design.md          # 設計書
│   ├─ task.md            # 実装タスク (このファイル)
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

## 実装タスク一覧

### Phase 1: プロジェクト基盤構築
- [x] タスク1-1: Vite + React + TypeScriptプロジェクトの初期化 ✅ 完了 (2025-07-24)
  - [x] package.json設定（dependencies, devDependencies, scripts）
  - [x] tsconfig.json設定
  - [x] ESLint, Prettier設定
  - [x] .env.local設定（VITE_DATA_MODE=local）
- [ ] タスク1-2: サンプルCSVデータの生成
  - [ ] public/sample_players.csv作成（12球団、各5選手以上）
  - [ ] 必要列：team, name, PA, 1B, 2B, 3B, HR, SO, BB, OUT_OTHER
- [x] タスク1-3: 基本的なディレクトリ構造の作成 ✅ 完了 (2025-07-24)
  - [x] src/components/, src/hooks/, src/worker/ディレクトリ作成
  - [x] src/config.ts作成（データソース切替機構）

### Phase 2: データ取得・管理機能
- [ ] タスク2-1: CSV取得・パース機能の実装
  - [ ] PapaParseによるCSV解析機能
  - [ ] TanStack QueryによるCSVデータのキャッシュ機能
  - [ ] usePlayers.tsフック実装
- [ ] タスク2-2: 選手データ型定義とバリデーション
  - [ ] Player型の定義
  - [ ] CSVデータの型安全性確保
  - [ ] データ形式バリデーション機能
- [ ] タスク2-3: Zustand状態管理の実装
  - [ ] 選手プール管理ストア
  - [ ] 打順履歴管理ストア
  - [ ] シミュレーション結果管理ストア

### Phase 3: UI コンポーネント実装
- [ ] タスク3-1: PlayerTableコンポーネント
  - [ ] 球団プルダウン選択機能
  - [ ] 選手一覧テーブル表示
  - [ ] 選手選択機能（9名まで）
  - [ ] 主要打撃成績表示
- [ ] タスク3-2: LineupEditorコンポーネント
  - [ ] dnd-kitによるドラッグ&ドロップ機能
  - [ ] 打順表示・編集機能
  - [ ] 選手削除機能
  - [ ] 打順検証機能（9名必須）
- [ ] タスク3-3: SimulationPanelコンポーネント
  - [ ] シミュレーション回数入力（数値・スライダー）
  - [ ] 入力値バリデーション（整数、上限10万回）
  - [ ] シミュレーション開始ボタン
  - [ ] プログレス表示機能

### Phase 4: シミュレーションエンジン実装
- [ ] タスク4-1: Web Workerシミュレーター基盤
  - [ ] worker/simulator.ts作成
  - [ ] メインスレッドとの通信インターフェース
  - [ ] 確率テーブル作成機能（Float32Array）
- [ ] タスク4-2: Monte-Carloシミュレーション
  - [ ] atBat()関数：Math.random() → 2分探索で打撃結果決定
  - [ ] 走者状態管理（ビット列 0b000-0b111）
  - [ ] ゲームループ（9回、3アウト制）
  - [ ] 統計計算（平均、中央値、90%tile）
- [ ] タスク4-3: ヒューリスティック最適化
  - [ ] 1箇所入れ替え探索アルゴリズム
  - [ ] 近隣・遠隔入れ替え方法選択
  - [ ] 改善判定・履歴記録機能
  - [ ] 終端条件（改善なし10回連続）

### Phase 5: データ可視化
- [ ] タスク5-1: Chart.js統合
  - [ ] Chart.js 4セットアップ
  - [ ] 得点分布ヒストグラム
  - [ ] 箱ひげ図表示
- [ ] タスク5-2: 結果表示コンポーネント
  - [ ] シミュレーション結果統計表示
  - [ ] グラフ描画コンポーネント
  - [ ] 最適化結果比較表示
- [ ] タスク5-3: HistoryGridコンポーネント
  - [ ] 打順・平均得点の履歴テーブル
  - [ ] 最高得点打順のハイライト表示
  - [ ] 元打順との差分表示

### Phase 6: CI/CD・デプロイメント
- [ ] タスク6-1: GitHub Actions設定
  - [ ] .github/workflows/deploy.yml作成
  - [ ] lint & buildワークフロー
  - [ ] peaceiris/actions-gh-pagesによるデプロイ
- [ ] タスク6-2: 環境変数・設定
  - [ ] REMOTE_CSV_URL repository secret設定
  - [ ] VITE_DATA_MODE=remote本番ビルド設定
  - [ ] GitHub Pages設定

## 技術仕様

### 使用技術
- **React 18**: フロントエンドフレームワーク
- **Vite**: ビルドツール・開発サーバー
- **TypeScript 5**: 型安全性確保
- **TanStack Query**: データフェッチ・キャッシュ
- **Zustand**: 軽量状態管理
- **PapaParse**: CSV解析
- **dnd-kit**: ドラッグ&ドロップ
- **Chart.js 4**: データ可視化
- **Web Worker**: バックグラウンド計算

### API仕様
- **CSV取得**: Google Spreadsheet公開CSV URL
- **データ形式**: team, name, PA, 1B, 2B, 3B, HR, SO, BB, OUT_OTHER
- **Web Worker通信**: postMessage/onmessage
- **環境変数**: VITE_DATA_MODE (local/remote)

### パフォーマンス要件
- 95th percentile応答時間（10試合）: < 200ms
- 95th percentile応答時間（最適化 1000試合×50反復）: < 10s
- シミュレーション上限: 10万回

## 品質基準

### コード品質
- TypeScriptビルドエラー: 0
- ESLintエラー: 0
- 型安全性100%確保
- コンポーネント単体テスト実装

### テスト要件
- ユーザーストーリー基準でのE2Eテスト
- シミュレーションエンジンの単体テスト
- CSV解析機能のテスト
- Web Worker通信テスト

### ドキュメント要件
- README.md（セットアップ・使用方法）
- 主要コンポーネントのTSDoc
- APIインターフェース仕様
- デプロイメント手順

## 成果物

- [ ] 動作するWebアプリケーション（GitHub Pages）
- [ ] 完全なソースコード（TypeScript）
- [ ] CI/CDパイプライン（GitHub Actions）
- [ ] テストスイート
- [ ] プロジェクトドキュメント
- [ ] サンプルデータセット（CSV）

## 注意事項・制約

### 非機能要件
- 認証不要・読み取り専用サイト（セキュリティ）
- GitHub Pages稼働率 ≥ 99.9%
- GitHub Actions成功率 ≥ 95%
- レスポンシブデザイン（PC・スマホ対応）

### 技術制約
- 静的サイト（GitHub Pages）
- クライアントサイド処理のみ
- Web Worker対応ブラウザ必須
- ES2020+対応ブラウザ

### 開発制約
- Git履歴の保持
- コミットメッセージ規約遵守
- PRベースの開発フロー
- コードレビュー必須

### データ制約
- CSV形式のみサポート
- Google Spreadsheet公開URL必須
- 12球団データ構造準拠
- 選手データの整合性確保