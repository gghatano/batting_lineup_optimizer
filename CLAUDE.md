# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

野球の打順最適化アプリケーション。Google Spreadsheetから取得した打撃成績データを基に、ブラウザ上で9人の打順をヒューリスティック最適化し、シミュレーションによる平均得点を可視化するWebアプリ。

## Technology Stack

- **Frontend**: React 18 + Vite + TypeScript 5
- **State Management**: TanStack Query (CSV fetch & cache) + Zustand (選手プール・履歴)
- **Data Processing**: PapaParse (CSV parsing)
- **Visualization**: Chart.js 4 (箱ひげ図・ヒストグラム)
- **Simulation**: Web Worker (TypeScript) でMonte-Carlo実行
- **Hosting**: GitHub Pages + GitHub Actions

## Development Commands

Based on the project structure with config files in config/ directory:

```bash
# Install dependencies
npm ci

# Development server (uses config/vite.config.ts)
npm run dev

# Lint code (uses config/eslint.config.js)
npm run lint

# Build for production (uses config/tsconfig.json + config/vite.config.ts)
npm run build

# Type checking (uses config/tsconfig.json)
npm run type-check
```

## Architecture Overview

### Directory Structure
```
root/
├─ public/
│   └─ vite.svg             # アイコン
├─ src/
│   ├─ config.ts            # データソース切替 (env)
│   ├─ hooks/
│   │   └─ usePlayers.ts    # CSV fetch → Player[]
│   ├─ worker/
│   │   └─ simulator.ts     # Monte-Carlo シミュレーション実装
│   ├─ components/
│   │   ├─ PlayerTable.tsx  # 選手選択テーブル
│   │   ├─ LineupEditor.tsx # 打順編集 (dnd-kit)
│   │   └─ HistoryGrid.tsx  # 履歴表示
│   └─ ...
├─ config/                  # 設定ファイル群
│   ├─ tsconfig.json        # TypeScript設定
│   ├─ tsconfig.app.json    # アプリ用TypeScript設定
│   ├─ tsconfig.node.json   # Node.js用TypeScript設定
│   ├─ eslint.config.js     # ESLint設定
│   └─ vite.config.ts       # Vite設定
├─ data/                    # データファイル
│   └─ sample_data.csv      # 実際の野球統計データ（日本語フィールド）
├─ docs/                    # プロジェクト文書
│   ├─ requirements.md      # 要件定義
│   ├─ design.md           # 設計書
│   ├─ task.md             # 実装タスク
│   ├─ progress.md         # 進捗管理
│   └─ development_workflow.md
├─ reports/                 # 進捗レポート
│   ├─ README.md
│   ├─ daily-report-template.md
│   └─ daily-report-YYYY-MM-DD-HHmmSS.md
├─ logs/                    # ログファイル
│   └─ server.log
└─ .github/
    └─ workflows/deploy.yml # GitHub Pages デプロイ
```

### Key Components

1. **データ取得**: Google Spreadsheet CSV または local CSV をPapaParseで処理
2. **シミュレーション**: Web Workerで高速なMonte-Carloシミュレーション
3. **最適化**: ヒューリスティック探索（1箇所入れ替え）で最適打順を探索
4. **UI**: dnd-kitによる打順編集、Chart.jsによるデータ可視化

## Environment Configuration

データソース切替は環境変数で制御:
- **Local development**: `.env.local` に `VITE_DATA_MODE=local` を設定
- **Production**: デフォルトで `remote` モード（Google Spreadsheet）

## Performance Requirements

- 95th percentile response time (10試合): < 200ms
- 95th percentile response time (最適化 1000試合×50反復): < 10s
- GitHub Pages uptime: ≥ 99.9%

## Data Format

CSV format expected:
```csv
team,name,PA,1B,2B,3B,HR,SO,BB,OUT_OTHER
Giants,Sato Haruki,600,120,25,3,30,110,60,252
```

## Testing & Deployment

- CI/CD through GitHub Actions
- Static analysis with ESLint/TypeScript
- Automated deployment to GitHub Pages
- Zero build errors/lint errors policy