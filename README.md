# 野球打順最適化アプリケーション

Google Spreadsheetから取得した打撃成績データを基に、ブラウザ上で9人の打順をヒューリスティック最適化し、シミュレーションによる平均得点を可視化するWebアプリケーションです。

## 🚀 主な機能

### ✅ Phase 1 & 2 (完了)
- **Google Sheets連携**: 実際の野球統計データをリアルタイム取得
- **カスタムURL入力**: ユーザー独自のデータソース対応
- **チーム別フィルタリング**: 効率的な選手選択
- **直感的UI**: 左側選手選択 → 右側打順確定のワークフロー
- **レスポンシブ対応**: デスクトップ・タブレット対応

### 🔄 Phase 3 (予定)
- **Monte-Carloシミュレーション**: Web Workerによる高速計算
- **打順最適化**: ヒューリスティック探索アルゴリズム
- **結果可視化**: Chart.jsによる統計グラフ表示
- **履歴管理**: 過去の最適化結果保存

## 🛠 技術スタック

### フロントエンド
- **React 18** + **TypeScript 5** - 型安全な開発環境
- **Vite** - 高速開発サーバー
- **TanStack Query v5** - データフェッチング・キャッシュ管理
- **PapaParse** - CSV解析

### データ統合
- **Google Sheets API** - CSV出力機能活用
- **CORS対応** - セキュリティ要件準拠

### 開発・デプロイ
- **ESLint** + **TypeScript** - 静的解析
- **GitHub Pages** - 静的サイトホスティング
- **GitHub Actions** - CI/CD自動化

## 📊 データ形式

アプリケーションは以下の形式のCSVデータに対応しています：

```csv
チーム,背番号,選手名,打率,試合,打席数,打数,得点,安打,二塁打,三塁打,本塁打,塁打,打点,盗塁,盗塁刺,犠打,犠飛,四球,敬遠,死球,三振,併殺打,出塁率,長打率
giants,2,吉川 尚輝,0.278,87,374,331,28,92,13,3,3,120,26,7,2,1,3,35,0,4,51,6,0.351,0.363
```

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18.0.0 以上
- npm 9.0.0 以上

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/your-username/batting-lineup-optimizer.git
cd batting-lineup-optimizer

# 依存関係のインストール
npm ci

# 開発サーバーの起動
npm run dev
```

### 環境変数設定
```bash
# .env.local ファイルを作成
VITE_DATA_MODE=remote
VITE_REMOTE_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing
```

## 📝 使用方法

### 1. データの準備
1. Google Sheetsで野球統計データを作成
2. シートを「リンクを知っている全員が閲覧可能」に設定
3. URLをアプリに入力

### 2. 選手選択
1. 左側のテーブルからチームでフィルタリング
2. 各選手の「追加」ボタンで打順に登録
3. 最大9名まで選択可能

### 3. 打順確定
1. 右側で選択した選手を確認
2. 不要な選手は「×」ボタンで削除
3. 9名揃ったらシミュレーション準備完了

## 🧪 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint実行
npm run lint

# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

## 📈 パフォーマンス指標

- **データ取得**: ~500ms (Google Sheets)
- **キャッシュヒット**: ~50ms
- **UI応答**: 即座に反映
- **エラー回復**: 3回リトライ + 指数バックオフ

## 🏗 アーキテクチャ

```
src/
├── components/          # Reactコンポーネント
│   └── PlayerTable.tsx  # 選手選択テーブル
├── hooks/              # カスタムフック
│   └── usePlayers.ts   # データフェッチング
├── types/              # TypeScript型定義
│   └── Player.ts       # 選手データ型
├── config.ts           # 設定・URL変換
└── App.tsx            # メインアプリケーション
```

## 🔧 今後の改善予定

### 短期 (Phase 3)
- Monte-Carloシミュレーション実装
- 打順最適化アルゴリズム
- 結果可視化機能

### 中期
- モバイル対応強化
- 履歴機能の充実
- パフォーマンス最適化

### 長期
- 複数リーグ対応
- 機械学習による予測機能
- リアルタイム協調編集

## 📚 ドキュメント

- [開発レポート Phase 1](./docs/development-report-phase1.md)
- [開発レポート Phase 2](./docs/development-report-phase2.md)
- [Google Sheets連携設定](./docs/google-sheets-setup.md)
- [プロジェクト設計書](./development_workflow.md)

## 🤝 コントリビューション

1. フォークしてブランチを作成
2. 機能を実装・テスト
3. プルリクエストを送信

## 📄 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照

## 👥 作成者

- **開発**: Claude Code (Anthropic AI Assistant)
- **プロジェクト管理**: [Your Name]

---

⚾ **Play Ball!** - データ駆動で最強の打順を見つけよう!