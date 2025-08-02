// 詳細表示用の打撃結果型定義
import { Player } from './Player'

export interface AtBatResult {
  inning: number
  outs: number
  batter: Player
  batterPosition: number // 打順位置 (1-9)
  result: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'hbp' | 'strikeout' | 'out'
  description: string // 打撃結果の説明
  runs: number // この打席で入った得点
  runnersAfter: string // 打席後の走者状況
}

export interface InningDetail {
  inning: number
  atBats: AtBatResult[]
  runs: number
  totalOuts: number
}

export interface GameDetail {
  innings: InningDetail[]
  finalScore: number
  totalAtBats: number
  gameTime: number // ミリ秒
}

export interface DetailedSimulationResult {
  gameDetail?: GameDetail
  summary: {
    averageScore: number
    variance: number
    standardDeviation: number
    minScore: number
    maxScore: number
    totalGames: number
    scores?: number[]
    executionTime?: number
  }
}

// 打撃結果の日本語表示用マッピング
export const RESULT_DESCRIPTIONS: Record<string, string> = {
  single: '単打',
  double: '二塁打',
  triple: '三塁打',
  homerun: '本塁打',
  walk: '四球',
  hbp: '死球',
  strikeout: '三振',
  out: 'アウト'
}

// 走者状況をビット列から文字列に変換
export const formatRunnerSituation = (runners: number): string => {
  if (runners === 0) return '走者なし'
  
  const bases: string[] = []
  if (runners & 1) bases.push('一塁')
  if (runners & 2) bases.push('二塁')
  if (runners & 4) bases.push('三塁')
  
  return bases.join('・')
}