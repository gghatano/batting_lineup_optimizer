// Web Worker用のシミュレーター実装
import { Player } from '../types/Player'
import { calculateAdvanceWithStatistics } from '../utils/baseballStatistics'

export interface SimulationParams {
  numberOfGames: number
  optimizationMethod: 'none' | 'random' | 'heuristic'
  maxIterations: number
  simulationId?: string
}

export interface SimulationMessage {
  type: 'start' | 'progress' | 'complete' | 'error'
  payload?: unknown
}

export interface SimulationRequest {
  lineup: Player[]
  params: SimulationParams
}

export interface GameDetail {
  gameNumber: number
  totalScore: number
  inningScores: number[] // 9イニングの得点
  playerStats: {
    playerIndex: number
    atBats: number
    hits: number
    runs: number
    rbis: number
  }[]
}

export interface SimulationResult {
  averageScore: number
  variance: number
  standardDeviation: number
  minScore: number
  maxScore: number
  totalGames: number
  improvementPercent?: number
  scores: number[]
  executionTime: number
  gameDetails?: GameDetail[] // 詳細データ（限定的に保存）
  hasDetailedData: boolean // 詳細データが利用可能かどうか
}

export interface ProgressUpdate {
  completedGames: number
  totalGames: number
  progress: number
  currentAverage: number
  simulationId?: string
}

// 選手の打撃確率テーブルを作成
interface BattingOutcome {
  type: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'strikeout' | 'out'
  probability: number
  bases: number
}

const createProbabilityTable = (player: Player): BattingOutcome[] => {
  const pa = player.打席数 || 1
  // 単打 = 安打 - (二塁打 + 三塁打 + 本塁打)
  const single = Math.max(0, (player.安打 - player.二塁打 - player.三塁打 - player.本塁打)) / pa
  const double = player.二塁打 / pa
  const triple = player.三塁打 / pa
  const homerun = player.本塁打 / pa
  const walk = (player.四球 + player.死球) / pa
  const strikeout = player.三振 / pa
  
  // その他のアウトを計算
  const hitAndWalk = single + double + triple + homerun + walk + strikeout
  const otherOut = Math.max(0, 1 - hitAndWalk)
  
  return [
    { type: 'homerun', probability: homerun, bases: 4 },
    { type: 'triple', probability: triple, bases: 3 },
    { type: 'double', probability: double, bases: 2 },
    { type: 'single', probability: single, bases: 1 },
    { type: 'walk', probability: walk, bases: 1 },
    { type: 'strikeout', probability: strikeout, bases: 0 },
    { type: 'out', probability: otherOut, bases: 0 }
  ]
}

// 累積確率テーブルを作成（二分探索用）
const createCumulativeProbabilities = (outcomes: BattingOutcome[]): Float32Array => {
  const cumulative = new Float32Array(outcomes.length)
  let sum = 0
  
  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i]
    if (outcome) {
      sum += outcome.probability
      cumulative[i] = sum
    }
  }
  
  // 正規化（確率の合計を1.0にする）
  const lastIndex = cumulative.length - 1
  const total = lastIndex >= 0 ? cumulative[lastIndex] : 0
  if (total && total > 0) {
    for (let i = 0; i < cumulative.length; i++) {
      cumulative[i]! /= total
    }
  }
  
  return cumulative
}

// 二分探索で打撃結果を決定
const getAtBatResult = (
  random: number, 
  cumulative: Float32Array, 
  outcomes: BattingOutcome[]
): BattingOutcome => {
  let left = 0
  let right = cumulative.length - 1
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (random <= cumulative[mid]!) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  
  return outcomes[left] || { type: 'out', probability: 1, bases: 0 }
}

// 走者状態を管理（ビット列: bit0=1塁, bit1=2塁, bit2=3塁）
interface BaseState {
  runners: number // 0b000-0b111
}

// 統計データに基づいた走者進塁処理（Web Worker版）
const advanceRunners = (
  baseState: BaseState, 
  hitType: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'hbp' | 'strikeout' | 'out',
  outs: number
): number => {
  const result = calculateAdvanceWithStatistics(baseState.runners, hitType, outs)
  baseState.runners = result.newRunners
  return result.runs
}

// 選手アクション詳細（詳細データ収集用）
interface PlayerAction {
  playerIndex: number
  result: string
  scored: boolean
  rbis: number
}

// 1イニングをシミュレート（詳細データ収集対応）
const simulateInning = (
  _lineup: Player[],
  probabilityTables: BattingOutcome[][],
  cumulativeTables: Float32Array[],
  batterIndex: number,
  collectDetails: boolean = false
): { runs: number, newBatterIndex: number, playerActions?: PlayerAction[] } => {
  let runs = 0
  let outs = 0
  let currentBatter = batterIndex
  const baseState: BaseState = { runners: 0 }
  const playerActions: PlayerAction[] = []
  
  while (outs < 3) {
    const outcomes = probabilityTables[currentBatter]
    const cumulative = cumulativeTables[currentBatter]
    
    if (!outcomes || !cumulative) {
      break
    }
    
    const random = Math.random()
    const result = getAtBatResult(random, cumulative, outcomes)
    
    let runsScored = 0
    let playerScored = false
    
    if (result.type === 'strikeout' || result.type === 'out') {
      outs++
      runsScored = advanceRunners(baseState, result.type, outs - 1) // アウトカウント増加前の状態で計算
    } else {
      runsScored = advanceRunners(baseState, result.type, outs)
      
      // 本塁打の場合は打者も得点
      if (result.type === 'homerun') {
        playerScored = true
      }
    }
    
    runs += runsScored
    
    // 詳細データ収集時はアクションを記録
    if (collectDetails) {
      playerActions.push({
        playerIndex: currentBatter,
        result: result.type,
        scored: playerScored,
        rbis: runsScored
      })
    }
    
    currentBatter = (currentBatter + 1) % 9
  }
  
  return { 
    runs, 
    newBatterIndex: currentBatter, 
    playerActions: collectDetails ? playerActions : undefined 
  }
}

// 1試合をシミュレート（詳細データ収集対応）
const simulateGame = (
  lineup: Player[],
  probabilityTables: BattingOutcome[][],
  cumulativeTables: Float32Array[],
  collectDetails: boolean = false,
  gameNumber?: number
): number | GameDetail => {
  let totalRuns = 0
  let batterIndex = 0
  let totalAtBats = 0
  const inningScores: number[] = []
  const playerStats = lineup.map((_, index) => ({
    playerIndex: index,
    atBats: 0,
    hits: 0,
    runs: 0,
    rbis: 0
  }))
  
  // 9イニング
  for (let inning = 0; inning < 9; inning++) {
    const { runs, newBatterIndex, playerActions } = simulateInning(
      lineup, 
      probabilityTables, 
      cumulativeTables, 
      batterIndex,
      collectDetails
    )
    totalRuns += runs
    inningScores.push(runs)
    batterIndex = newBatterIndex
    
    // 詳細データ収集時は選手統計を更新
    if (collectDetails && playerActions) {
      playerActions.forEach(action => {
        const stat = playerStats[action.playerIndex]
        if (stat) {
          stat.atBats += 1
          if (['single', 'double', 'triple', 'homerun'].includes(action.result)) {
            stat.hits += 1
          }
          if (action.scored) stat.runs += 1
          stat.rbis += action.rbis || 0
        }
      })
    }
    
    // デバッグ用: イニングごとの処理確認
    totalAtBats += 3 // 最低でも3アウト分の処理が発生するはず
  }
  
  // デバッグ用: 異常に少ない打席数の場合はログ
  if (totalAtBats < 27) { // 9イニング * 3アウト = 最低27打席
    console.warn(`⚠️ 異常に少ない打席数: ${totalAtBats}打席, 得点: ${totalRuns}`)
  }
  
  if (collectDetails && gameNumber !== undefined) {
    return {
      gameNumber,
      totalScore: totalRuns,
      inningScores,
      playerStats
    } as GameDetail
  }
  
  return totalRuns
}

// メインのシミュレーション関数

export const runMonteCarloSimulation = async (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<SimulationResult> => {
  const startTime = performance.now()
  console.log(`🚀 Monte-Carloシミュレーション開始: ${params.numberOfGames}試合`)
  
  // 各選手の確率テーブルを事前計算
  const probabilityTables = lineup.map(createProbabilityTable)
  const cumulativeTables = probabilityTables.map(createCumulativeProbabilities)
  
  console.log(`📊 確率テーブル生成完了: ${lineup.length}選手`)
  console.log(`🎲 最初の選手の確率例: `, probabilityTables[0])
  
  const scores: number[] = []
  // プログレス更新の頻度を調整 (最大1000試合間隔、最小100試合間隔)
  const progressInterval = Math.max(100, Math.min(1000, Math.floor(params.numberOfGames / 100)))
  console.log(`📊 プログレス更新間隔: ${progressInterval}試合ごと`)
  
  console.log(`🎮 ゲームループ開始: ${params.numberOfGames}試合`)
  
  // 初回プログレス更新（0%で開始）
  if (onProgress) {
    console.log(`🚀 初回プログレス更新送信`)
    onProgress({
      completedGames: 0,
      totalGames: params.numberOfGames,
      progress: 0,
      currentAverage: 0
    })
  }
  
  // 詳細データ収集の判定（1000試合以下の場合のみ）
  const shouldCollectDetails = params.numberOfGames <= 1000
  const gameDetails: GameDetail[] = []
  
  for (let game = 0; game < params.numberOfGames; game++) {
    const gameStartTime = performance.now()
    const gameResult = simulateGame(
      lineup, 
      probabilityTables, 
      cumulativeTables, 
      shouldCollectDetails, 
      game + 1
    )
    const gameEndTime = performance.now()
    const gameTime = gameEndTime - gameStartTime
    
    if (shouldCollectDetails && typeof gameResult === 'object') {
      // 詳細データを保存
      gameDetails.push(gameResult)
      scores.push(gameResult.totalScore)
    } else {
      // 基本データのみ
      scores.push(gameResult as number)
    }
    
    // デバッグ用：最初の10試合の詳細ログ + 実行時間
    if (game < 10) {
      const displayScore = shouldCollectDetails && typeof gameResult === 'object' 
        ? gameResult.totalScore 
        : gameResult as number
      console.log(`🏆 試合${game + 1}: ${displayScore}点 (${gameTime.toFixed(2)}ms)`)
    }
    
    // デバッグ用：100試合ごとに平均ゲーム時間をログ
    if ((game + 1) % 100 === 0) {
      const avgGameTime = (performance.now() - startTime) / (game + 1)
      console.log(`⏱️ 100試合経過: 平均ゲーム時間 ${avgGameTime.toFixed(3)}ms`)
    }
    
    // プログレス更新
    if (onProgress && (game + 1) % progressInterval === 0) {
      const currentAverage = scores.reduce((a, b) => a + b, 0) / scores.length
      const progress = (game + 1) / params.numberOfGames
      
      console.log(`📈 進捗: ${(progress * 100).toFixed(1)}% (${game + 1}/${params.numberOfGames}試合), 平均: ${currentAverage.toFixed(2)}点`)
      
      onProgress({
        completedGames: game + 1,
        totalGames: params.numberOfGames,
        progress,
        currentAverage,
        simulationId: params.simulationId
      })
    }
    
    // 1000試合ごとに中間結果をログ
    if ((game + 1) % 1000 === 0) {
      const currentAverage = scores.reduce((a, b) => a + b, 0) / scores.length
      console.log(`🎯 中間結果 ${game + 1}試合: 平均${currentAverage.toFixed(2)}点`)
    }
    
    // UIブロッキングを防ぐため少数の試合ごとに制御を戻す
    if (game % 1000 === 0 && game > 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  const endTime = performance.now()
  const executionTime = endTime - startTime
  
  console.log(`⏱️ シミュレーション実行時間: ${executionTime.toFixed(0)}ms`)
  console.log(`🎯 全${params.numberOfGames}試合完了`)
  
  // 統計計算（メモリ効率化: 展開演算子を使わない）
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  // 🚨 修正: 大きな配列での展開演算子クラッシュを回避
  let minScore = scores[0] || 0
  let maxScore = scores[0] || 0
  for (let i = 1; i < scores.length; i++) {
    const score = scores[i]!
    if (score < minScore) minScore = score
    if (score > maxScore) maxScore = score
  }
  
  console.log(`📊 最終統計: 平均${averageScore.toFixed(2)}点, 範囲${minScore}-${maxScore}点, 標準偏差${standardDeviation.toFixed(2)}`)
  console.log(`⚡ パフォーマンス: ${(params.numberOfGames / (executionTime / 1000)).toFixed(0)}試合/秒`)
  
  return {
    averageScore,
    variance,
    standardDeviation,
    minScore,
    maxScore,
    totalGames: params.numberOfGames,
    scores,
    executionTime,
    gameDetails: shouldCollectDetails ? gameDetails : undefined,
    hasDetailedData: shouldCollectDetails
  }
}

// Web Worker context
declare const self: Worker

// メッセージハンドリング
self.onmessage = async (event: MessageEvent<SimulationRequest>) => {
  const { lineup, params } = event.data
  
  try {
    const result = await runMonteCarloSimulation(
      lineup,
      params,
      (progress) => {
        self.postMessage({
          type: 'progress',
          payload: progress
        } as SimulationMessage)
      }
    )
    
    self.postMessage({
      type: 'complete',
      payload: result
    } as SimulationMessage)
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error'
    } as SimulationMessage)
  }
}