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

## 開発戦略

### ローカル開発優先アプローチ
本プロジェクトでは、以下の戦略でローカル開発を完了させてからGitHub Pagesへデプロイします：

#### 開発完了基準
1. **核心機能の完全動作**
   - Monte-Carloシミュレーション（Web Worker）
   - ヒューリスティック最適化アルゴリズム
   - Chart.jsによる結果可視化
   
2. **品質基準の達成**
   - TypeScriptコンパイルエラー: 0件
   - ESLintエラー: 0件
   - 主要ユーザーフローの動作確認
   
3. **パフォーマンス基準**
   - 95th percentile応答時間（10試合）: < 200ms
   - 95th percentile応答時間（最適化 1000試合×50反復）: < 10s

#### デプロイタイミング
- **Phase 4-5完了後**: シミュレーション・可視化機能の実装完了
- **最終品質チェック**: 全機能の統合テスト完了
- **GitHub Pages展開**: 安定動作確認後に本番デプロイ

## 実装タスク一覧

### Phase 1: プロジェクト基盤構築
- [x] タスク1-1: Vite + React + TypeScriptプロジェクトの初期化 ✅ 完了 (2025-07-24)
  - [x] package.json設定（dependencies, devDependencies, scripts）
  - [x] tsconfig.json設定
  - [x] ESLint, Prettier設定
  - [x] .env.local設定（VITE_DATA_MODE=local）
- [x] タスク1-2: サンプルCSVデータの生成 ✅ 完了 (2025-07-24)
  - [x] data/sample_players.csv作成（12球団、各6選手・計72選手）
  - [x] 必要列：team, name, PA, 1B, 2B, 3B, HR, SO, BB, OUT_OTHER
- [x] タスク1-3: 基本的なディレクトリ構造の作成 ✅ 完了 (2025-07-24)
  - [x] src/components/, src/hooks/, src/worker/ディレクトリ作成
  - [x] src/config.ts作成（データソース切替機構）

### Phase 2: データ取得・管理機能
- [x] タスク2-1: CSV取得・パース機能の実装 ✅ 完了 (2025-07-26)
  - [x] PapaParseによるCSV解析機能（日本語ヘッダー対応）
  - [x] TanStack QueryによるCSVデータのキャッシュ機能
  - [x] usePlayers.tsフック実装
  - [x] Google Sheets URL変換システム実装
  - [x] 動的URL入力機能とバリデーション
- [x] タスク2-2: 選手データ型定義とバリデーション ✅ 完了 (2025-07-26)
  - [x] Player型の定義（25フィールド日本語対応）
  - [x] CSVデータの型安全性確保
  - [x] データ形式バリデーション機能
  - [x] 必須フィールドチェック強化
- [x] タスク2-3: 状態管理とUI最適化の実装 ✅ 完了 (2025-07-26)
  - [x] 選手選択・打順管理機能
  - [x] レイアウト最適化（選手選択左→打順表示右）
  - [x] チーム機能復活（動的一覧・フィルタリング）
  - [x] テーブル表示最適化（シミュレーション用フィールド追加）

### Phase 3: UI コンポーネント実装
- [x] タスク3-1: PlayerTableコンポーネント ✅ 完了 (2025-07-24)
  - [x] 球団プルダウン選択機能
  - [x] 選手一覧テーブル表示（打率・出塁率・長打率等）
  - [x] 選手選択機能（同一選手複数選択対応）
  - [x] 主要打撃成績表示
  - [x] 打順表示エリア（左右分割レイアウト）
  - [x] 個別削除ボタン機能
  - [x] 打順欄への成績表示（打率・本塁打数）
- [x] タスク3-1-2: LineupEditorコンポーネント ✅ 完了 (2025-07-26)
  - [x] 打順表示・編集機能
  - [x] 選手削除機能
  - [x] 打順検証機能（9名必須）
  - [x] 視覚的な打順確認機能
- [x] タスク3-2: UI/UX改善・見た目向上 ✅ 完了 (2025-07-26)
  - [x] レイアウト最適化（選手選択左→打順表示右）
  - [x] テーブル表示最適化
  - [x] チーム機能の統合
  - [x] 基本的なレスポンシブ対応
  - [x] ユーザビリティ向上
- [x] タスク3-3: SimulationPanelコンポーネント ✅ 完了 (2025-07-26)
  - [x] シミュレーション回数入力（数値・スライダー）
  - [x] 入力値バリデーション（整数、上限10万回）
  - [x] シミュレーション開始ボタン
  - [x] プログレス表示機能
  - [x] 3列レイアウト（打順・パラメータ・結果）

### Phase 4: シミュレーションエンジン実装
- [x] タスク4-1: Web Workerシミュレーター基盤 ✅ 完了 (2025-07-26)
  - [x] worker/simulator.ts作成
  - [x] メインスレッドとの通信インターフェース
  - [x] 確率テーブル作成機能（Float32Array）
- [x] タスク4-2: Monte-Carloシミュレーション ✅ 完了 (2025-07-26)
  - [x] atBat()関数：Math.random() → 2分探索で打撃結果決定
  - [x] 走者状態管理（ビット列 0b000-0b111）
  - [x] ゲームループ（9回、3アウト制）
  - [x] 統計計算（平均、中央値、90%tile）
  - [x] 実際の野球統計データ統合システム実装
  - [x] 詳細表示モード（1試合27アウト打撃記録表示）
- [x] タスク4-3: 実際の野球統計に基づいた進塁システム ✅ 完了 (2025-07-26)
  - [x] ADVANCE_PROBABILITIESテーブル実装
  - [x] 状況別進塁確率（三塁走者+アウト、二塁走者+単打、一塁走者+二塁打）
  - [x] calculateAdvanceWithStatistics()関数実装
  - [x] デバッグログシステム（異常得点検出）
  - [x] バグ修正：2アウト時のアウトで不正な得点発生問題解決

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

### Phase 6: 本番デプロイ準備・GitHub Pages
- [ ] タスク6-1: ローカル開発完了基準の達成
  - [ ] 核心機能（シミュレーション・最適化）の動作確認
  - [ ] エラーハンドリングの完備
  - [ ] 基本的なテストの実施
  - [ ] TypeScript・ESLintエラー0の維持
- [ ] タスク6-2: GitHub Pages デプロイ環境整備
  - [ ] .github/workflows/deploy.yml作成
  - [ ] lint & build ワークフローの設定
  - [ ] peaceiris/actions-gh-pages による自動デプロイ
  - [ ] VITE_DATA_MODE=remote 本番ビルド設定
- [ ] タスク6-3: 本番環境設定
  - [ ] GitHub Pages設定の有効化
  - [ ] REMOTE_CSV_URL repository secret設定
  - [ ] カスタムドメイン設定（必要に応じて）
  - [ ] HTTPS化とセキュリティ設定
- [ ] タスク6-4: デプロイ手順書の整備
  - [ ] デプロイメント手順の文書化
  - [ ] 環境変数設定手順
  - [ ] トラブルシューティングガイド
  - [ ] 運用・保守手順

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