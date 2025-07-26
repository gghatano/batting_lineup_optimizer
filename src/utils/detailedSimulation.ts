// 詳細表示用シミュレーション
import { Player } from '../types/Player'
import { AtBatResult, InningDetail, GameDetail, RESULT_DESCRIPTIONS, formatRunnerSituation } from '../types/GameDetail'
import { calculateAdvanceWithStatistics, logAdvanceResult } from './baseballStatistics'

interface BattingOutcome {
  type: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'hbp' | 'strikeout' | 'out'
  probability: number
  bases: number
}

interface BaseState {
  runners: number // ビット列: bit0=1塁, bit1=2塁, bit2=3塁
}

// 選手の打撃確率テーブルを作成
const createProbabilityTable = (player: Player): BattingOutcome[] => {
  const pa = player.打席数 || 1
  // 単打 = 安打 - (二塁打 + 三塁打 + 本塁打)
  const single = Math.max(0, (player.安打 - player.二塁打 - player.三塁打 - player.本塁打)) / pa
  const double = player.二塁打 / pa
  const triple = player.三塁打 / pa
  const homerun = player.本塁打 / pa
  const walk = player.四球 / pa
  const hbp = player.死球 / pa
  const strikeout = player.三振 / pa
  
  // その他のアウトを計算
  const hitAndWalk = single + double + triple + homerun + walk + hbp + strikeout
  const otherOut = Math.max(0, 1 - hitAndWalk)
  
  return [
    { type: 'homerun', probability: homerun, bases: 4 },
    { type: 'triple', probability: triple, bases: 3 },
    { type: 'double', probability: double, bases: 2 },
    { type: 'single', probability: single, bases: 1 },
    { type: 'walk', probability: walk, bases: 1 },
    { type: 'hbp', probability: hbp, bases: 1 },
    { type: 'strikeout', probability: strikeout, bases: 0 },
    { type: 'out', probability: otherOut, bases: 0 }
  ]
}

// 累積確率テーブルを作成
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
  
  // 正規化
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

// 統計データに基づいた走者進塁処理
const advanceRunners = (
  baseState: BaseState, 
  hitType: 'single' | 'double' | 'triple' | 'homerun' | 'walk' | 'hbp' | 'strikeout' | 'out',
  outs: number
): number => {
  const result = calculateAdvanceWithStatistics(baseState.runners, hitType, outs)
  
  // デバッグログ（2アウト時のアウトは常にログ出力）
  if (outs === 2 && hitType === 'out') {
    logAdvanceResult(baseState.runners, hitType, outs, result)
  }
  
  baseState.runners = result.newRunners
  return result.runs
}

// 1イニングを詳細シミュレート
const simulateInningDetailed = (
  lineup: Player[],
  probabilityTables: BattingOutcome[][],
  cumulativeTables: Float32Array[],
  batterIndex: number,
  inningNumber: number
): { detail: InningDetail, newBatterIndex: number } => {
  let runs = 0
  let outs = 0
  let currentBatter = batterIndex
  const baseState: BaseState = { runners: 0 }
  const atBats: AtBatResult[] = []
  
  while (outs < 3) {
    const player = lineup[currentBatter]!
    const outcomes = probabilityTables[currentBatter]
    const cumulative = cumulativeTables[currentBatter]
    
    if (!outcomes || !cumulative) {
      break
    }
    
    const random = Math.random()
    const result = getAtBatResult(random, cumulative, outcomes)
    
    const runsBefore = runs
    
    if (result.type === 'strikeout' || result.type === 'out') {
      outs++
      runs += advanceRunners(baseState, result.type, outs - 1) // アウトカウント増加前の状態で計算
    } else {
      runs += advanceRunners(baseState, result.type, outs)
    }
    
    const runsScored = runs - runsBefore
    
    // 打席結果を記録
    const atBatResult: AtBatResult = {
      inning: inningNumber,
      outs: outs,
      batter: player,
      batterPosition: currentBatter + 1,
      result: result.type,
      description: RESULT_DESCRIPTIONS[result.type] || result.type,
      runs: runsScored,
      runnersAfter: formatRunnerSituation(baseState.runners)
    }
    
    atBats.push(atBatResult)
    
    currentBatter = (currentBatter + 1) % 9
  }
  
  return {
    detail: {
      inning: inningNumber,
      atBats,
      runs,
      totalOuts: outs
    },
    newBatterIndex: currentBatter
  }
}

// 1試合を詳細シミュレート
export const simulateGameDetailed = (lineup: Player[]): GameDetail => {
  const startTime = performance.now()
  
  // 各選手の確率テーブルを事前計算
  const probabilityTables = lineup.map(createProbabilityTable)
  const cumulativeTables = probabilityTables.map(createCumulativeProbabilities)
  
  let totalRuns = 0
  let totalAtBats = 0
  let batterIndex = 0
  const innings: InningDetail[] = []
  
  // 9イニング
  for (let inning = 1; inning <= 9; inning++) {
    const { detail, newBatterIndex } = simulateInningDetailed(
      lineup, 
      probabilityTables, 
      cumulativeTables, 
      batterIndex,
      inning
    )
    
    totalRuns += detail.runs
    totalAtBats += detail.atBats.length
    batterIndex = newBatterIndex
    innings.push(detail)
  }
  
  const endTime = performance.now()
  
  return {
    innings,
    finalScore: totalRuns,
    totalAtBats,
    gameTime: endTime - startTime
  }
}

// 通常のシミュレーション（詳細なし）
export const simulateGameNormal = (lineup: Player[]): number => {
  // 各選手の確率テーブルを事前計算
  const probabilityTables = lineup.map(createProbabilityTable)
  const cumulativeTables = probabilityTables.map(createCumulativeProbabilities)
  
  let totalRuns = 0
  let batterIndex = 0
  
  // 9イニング
  for (let inning = 0; inning < 9; inning++) {
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
        runs += advanceRunners(baseState, result.type, outs - 1)
      } else {
        runs += advanceRunners(baseState, result.type, outs)
      }
      
      currentBatter = (currentBatter + 1) % 9
    }
    
    totalRuns += runs
    batterIndex = currentBatter
  }
  
  return totalRuns
}