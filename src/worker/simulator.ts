// Web Worker用のシミュレーター実装
import { Player } from '../types/Player'
import { calculateAdvanceWithStatistics } from '../utils/baseballStatistics'

export interface SimulationParams {
  numberOfGames: number
  optimizationMethod: 'none' | 'random' | 'heuristic'
  maxIterations: number
}

export interface SimulationMessage {
  type: 'start' | 'progress' | 'complete' | 'error'
  payload?: any
}

export interface SimulationRequest {
  lineup: Player[]
  params: SimulationParams
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
}

export interface ProgressUpdate {
  completedGames: number
  totalGames: number
  progress: number
  currentAverage: number
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

// 1イニングをシミュレート
const simulateInning = (
  _lineup: Player[],
  probabilityTables: BattingOutcome[][],
  cumulativeTables: Float32Array[],
  batterIndex: number
): { runs: number, newBatterIndex: number } => {
  let runs = 0
  let outs = 0
  let currentBatter = batterIndex
  const baseState: BaseState = { runners: 0 }
  
  while (outs < 3) {
    const outcomes = probabilityTables[currentBatter]
    const cumulative = cumulativeTables[currentBatter]
    
    if (!outcomes || !cumulative) {
      break
    }
    
    const random = Math.random()
    const result = getAtBatResult(random, cumulative, outcomes)
    
    if (result.type === 'strikeout' || result.type === 'out') {
      outs++
      runs += advanceRunners(baseState, result.type, outs - 1) // アウトカウント増加前の状態で計算
    } else {
      runs += advanceRunners(baseState, result.type, outs)
    }
    
    currentBatter = (currentBatter + 1) % 9
  }
  
  return { runs, newBatterIndex: currentBatter }
}

// 1試合をシミュレート
const simulateGame = (
  lineup: Player[],
  probabilityTables: BattingOutcome[][],
  cumulativeTables: Float32Array[]
): number => {
  let totalRuns = 0
  let batterIndex = 0
  
  // 9イニング
  for (let inning = 0; inning < 9; inning++) {
    const { runs, newBatterIndex } = simulateInning(
      lineup, 
      probabilityTables, 
      cumulativeTables, 
      batterIndex
    )
    totalRuns += runs
    batterIndex = newBatterIndex
  }
  
  return totalRuns
}

// メインのシミュレーション関数
export const runMonteCarloSimulation = (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<SimulationResult> => {
  return new Promise((resolve, reject) => {
    try {
      const startTime = performance.now()
      
      // 各選手の確率テーブルを事前計算
      const probabilityTables = lineup.map(createProbabilityTable)
      const cumulativeTables = probabilityTables.map(createCumulativeProbabilities)
      
      const scores: number[] = []
      const progressInterval = Math.max(1, Math.floor(params.numberOfGames / 100))
      
      for (let game = 0; game < params.numberOfGames; game++) {
        const score = simulateGame(lineup, probabilityTables, cumulativeTables)
        scores.push(score)
        
        // プログレス更新
        if (onProgress && (game + 1) % progressInterval === 0) {
          const currentAverage = scores.reduce((a, b) => a + b, 0) / scores.length
          const progress = (game + 1) / params.numberOfGames
          
          onProgress({
            completedGames: game + 1,
            totalGames: params.numberOfGames,
            progress,
            currentAverage
          })
        }
      }
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      // 統計計算
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
      const standardDeviation = Math.sqrt(variance)
      const minScore = Math.min(...scores)
      const maxScore = Math.max(...scores)
      
      resolve({
        averageScore,
        variance,
        standardDeviation,
        minScore,
        maxScore,
        totalGames: params.numberOfGames,
        scores,
        executionTime
      })
    } catch (error) {
      reject(error)
    }
  })
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