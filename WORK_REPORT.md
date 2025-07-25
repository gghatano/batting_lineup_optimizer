# 野球打順最適化アプリ開発レポート

## プロジェクト概要

野球の打順最適化アプリケーションの開発を進行中。Google Spreadsheetから取得した打撃成績データを基に、ブラウザ上で9人の打順をヒューリスティック最適化し、シミュレーションによる平均得点を可視化するWebアプリ。

## 技術スタック

- **Frontend**: React 18 + Vite + TypeScript 5
- **State Management**: TanStack Query (CSV fetch & cache) + Zustand (選手プール・履歴)
- **Data Processing**: PapaParse (CSV parsing)
- **Visualization**: Chart.js 4 (箱ひげ図・ヒストグラム)
- **Simulation**: Web Worker (TypeScript) でMonte-Carlo実行予定
- **UI Design**: Atlassian Design System準拠
- **Hosting**: GitHub Pages + GitHub Actions

## 実装完了機能

### Phase 1-2: データ統合とUI基盤
✅ **完了済み**
- Vite + React + TypeScript 5 プロジェクト初期化
- 日本語野球統計データ対応（sample_data.csv）
- Google Sheets CSV統合（URL入力でリモートデータ取得）
- Atlassian Design System準拠のUI実装
- レスポンシブ2列レイアウト（選手選択 + 打順編集）

### Phase 3: シミュレーション機能基盤
✅ **完了済み**
- 3画面モード実装（選手選択 → シミュレーション実行）
- 9人完成時の「実験開始」ボタン
- 3列シミュレーション画面レイアウト
  - 左: 打順表示（LineupDisplay）
  - 中央: 実験設定（SimulationParameters）
  - 右: 結果表示（SimulationResults）

### 最新追加機能（本セッション）

#### 1. UI最適化・高さ調整
- 打順表示領域の各行高さを36pxに縮小
- 「打順完成！」メッセージとボタンを上部に移動
- 9人分の打順が見切れないよう最適化

#### 2. パフォーマンステスト機能
- 「10試合で時間計測」ベンチマーク機能
- 1試合当たりの平均実行時間を表示
- 入力試合数に基づく想定所要時間の動的計算・表示
- ms/秒/分の適切な単位表示

#### 3. ツールチップUI改善
- 新規Tooltipコンポーネント作成
- InfoIconコンポーネント（「?」マーク）
- 「打順統計」の詳細数値をツールチップに移動
- 「最適化手法」説明文をツールチップに移動
- UI画面のクリーンアップ（冗長なテキスト削除）

## アーキテクチャ構成

### ディレクトリ構造
```
src/
├─ components/
│   ├─ Button.tsx           # 統一ボタンコンポーネント
│   ├─ Input.tsx            # 統一入力フィールド
│   ├─ Badge.tsx            # ステータス表示
│   ├─ LoadingSpinner.tsx   # ローディング表示
│   ├─ PlayerTable.tsx      # 選手選択テーブル
│   ├─ LineupDisplay.tsx    # 打順表示（シミュレーション画面）
│   ├─ SimulationParameters.tsx  # 実験設定パラメータ
│   ├─ SimulationResults.tsx     # シミュレーション結果表示
│   └─ Tooltip.tsx          # ツールチップとアイコン
├─ hooks/
│   └─ usePlayers.ts        # CSV fetch → Player[]
├─ utils/
│   └─ simulation.ts        # Monte-Carlo シミュレーション
├─ styles/
│   └─ atlassian-theme.ts   # Atlassian Design System準拠テーマ
└─ types/
    └─ Player.ts            # 選手データ型定義
```

### データフロー
1. **データ取得**: Google Sheets URL または local CSV → PapaParse
2. **選手選択**: PlayerTable → selectedPlayers state
3. **打順編集**: 9人選択完了で「実験開始」有効化
4. **シミュレーション**: パフォーマンステスト → パラメータ設定 → 実行

## パフォーマンス仕様

- **ベンチマーク**: 10試合での時間計測
- **予想時間表示**: 試合数×最適化反復回数での動的計算
- **想定レスポンス**: 1000試合シミュレーション < 10秒
- **UI応答性**: 36px行高での9人打順表示最適化

## データ形式

現在対応のCSV形式:
```csv
チーム,選手名,背番号,打率,打席数,単打,二塁打,三塁打,本塁打,三振,四球,死球,打点,試合,出塁率,長打率
Giants,佐藤遥輝,1,0.295,600,120,25,3,30,110,60,5,85,144,0.365,0.485
```

## 実装状況と次ステップ

### 完了済み
- ✅ 基本UI/UX（Atlassian Design System準拠）
- ✅ データ統合（Google Sheets + local CSV）
- ✅ 選手選択とバッティングオーダー編集
- ✅ シミュレーション画面フロー
- ✅ パフォーマンステスト機能
- ✅ ツールチップによるUI改善

### 開発予定
- 🔄 Monte-Carlo シミュレーション詳細実装
- 🔄 Web Worker統合（高速化）
- 🔄 ヒューリスティック最適化アルゴリズム
- 🔄 Chart.js可視化（箱ひげ図・ヒストグラム）
- 🔄 結果データのexport機能

## 技術的課題と解決状況

### 解決済み
1. **TanStack Query v5 API変更**: retryCondition廃止対応
2. **TypeScript型エラー**: SimulationParams interface統合
3. **UI高さ最適化**: 36px行高での9人表示対応
4. **パフォーマンス測定**: ベンチマーク機能実装

### 継続課題
1. **リアルタイムシミュレーション**: Web Worker統合
2. **最適化アルゴリズム精度**: ヒューリスティック手法改善
3. **データ可視化**: Chart.js統合

## Git管理状況

- **現在ブランチ**: develop
- **作業状況**: 最新機能実装完了、commit準備中
- **管理方針**: feature branchでの機能開発 → develop統合

本レポート作成時点で、UI最適化・パフォーマンステスト・ツールチップ機能の実装が完了し、developブランチへのcommit準備が整いました。