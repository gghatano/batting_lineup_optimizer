import { Player } from '../types/Player'
import { SimulationResult } from '../components/SimulationResults'
import { getSimulationWorker, runSimulationFallback } from './simulationWorker'
import { createOptimizer, OptimizationResult } from './optimization'
import { simulateGameDetailed } from './detailedSimulation'
import { GameDetail } from '../types/GameDetail'

export interface SimulationParams {
  numberOfGames: number
  optimizationMethod: 'none' | 'random' | 'heuristic'
  maxIterations: number
  showDetailedView?: boolean
  simulationId?: string
}

// プログレス更新コールバックの型定義
export interface ProgressCallback {
  (progress: { completedGames: number; totalGames: number; progress: number; currentAverage: number; simulationId?: string }): void
}

// 統合されたシミュレーション実行関数
export const runSimulation = async (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: ProgressCallback
): Promise<SimulationResult & { optimizationResult?: OptimizationResult, gameDetail?: GameDetail }> => {
  const startTime = performance.now()
  console.log(`🎯 シミュレーション開始: ${params.numberOfGames}試合, 最適化: ${params.optimizationMethod}, 詳細表示: ${params.showDetailedView}`)
  
  // 詳細表示モードの場合
  if (params.showDetailedView) {
    console.log('📋 詳細表示モード - 1試合の詳細シミュレーションを実行')
    const gameDetail = simulateGameDetailed(lineup)
    const endTime = performance.now()
    const totalExecutionTime = endTime - startTime
    
    console.log('🏁 詳細シミュレーション完了:', gameDetail)
    
    return {
      averageScore: gameDetail.finalScore,
      variance: 0,
      standardDeviation: 0,
      minScore: gameDetail.finalScore,
      maxScore: gameDetail.finalScore,
      totalGames: 1,
      scores: [gameDetail.finalScore],
      executionTime: totalExecutionTime,
      gameDetail
    }
  }
  
  const worker = getSimulationWorker()
  
  try {
    // 基本シミュレーション実行
    let baseResult: SimulationResult
    
    console.log(`🎮 シミュレーション実行方法の決定...`)
    console.log(`📊 Web Worker利用可能: ${worker ? 'Yes' : 'No'}`)
    console.log(`🔄 Web Worker実行中: ${worker ? worker.isSimulationRunning : 'N/A'}`)
    
    // 🚨 強制的にフォールバックを使用して問題を特定
    console.log(`🚨 デバッグ: 強制的にフォールバック実行を使用`)
    const fallbackStartTime = performance.now()
    
    // メインシミュレーション用のIDを生成
    const simulationId = `main_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`🎯 フォールバック用シミュレーションID: ${simulationId}`)
    
    // プログレス更新コールバックでIDを含める
    const progressWithId = onProgress ? (progress: {completedGames: number; totalGames: number; progress: number; currentAverage: number}) => {
      onProgress({ ...progress, simulationId })
    } : undefined
    
    baseResult = await runSimulationFallback(lineup, params, progressWithId)
    const fallbackEndTime = performance.now()
    console.log(`✅ 強制フォールバック完了: ${(fallbackEndTime - fallbackStartTime).toFixed(0)}ms`)
    console.log(`📊 フォールバック結果: 平均${baseResult.averageScore.toFixed(2)}点, 範囲${baseResult.minScore}-${baseResult.maxScore}点`)
    
    // 元のコード（一時的にコメントアウト）
    /*
    if (worker.isSimulationRunning) {
      console.log('⚠️ Web Worker使用中 - フォールバック使用')
      baseResult = await runSimulationFallback(lineup, params)
    } else {
      try {
        console.log(`🚀 Web Workerでシミュレーション実行開始: ${params.numberOfGames}試合`)
        const workerStartTime = performance.now()
        baseResult = await worker.runSimulation(lineup, params)
        const workerEndTime = performance.now()
        console.log(`✅ Web Workerシミュレーション完了: ${(workerEndTime - workerStartTime).toFixed(0)}ms`)
        console.log(`📊 Web Worker結果: 平均${baseResult.averageScore.toFixed(2)}点, 範囲${baseResult.minScore}-${baseResult.maxScore}点`)
      } catch (error) {
        console.warn('❌ Web Worker失敗, フォールバック使用:', error)
        const fallbackStartTime = performance.now()
        baseResult = await runSimulationFallback(lineup, params)
        const fallbackEndTime = performance.now()
        console.log(`✅ フォールバック完了: ${(fallbackEndTime - fallbackStartTime).toFixed(0)}ms`)
      }
    }
    */

    // 最適化実行（必要な場合）
    if (params.optimizationMethod !== 'none') {
      console.log(`🔧 最適化実行開始: ${params.optimizationMethod}方式`)
      const optimizer = createOptimizer(params.optimizationMethod)
      
      try {
        // 最適化中はプログレス更新を無効化（2周問題を回避）
        // 最適化用の異なるIDを使用してメインシミュレーションと区別
        const optimizationParams = {
          ...params,
          simulationId: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        console.log(`🔧 最適化用シミュレーションID: ${optimizationParams.simulationId}`)
        
        const optimizationResult = await optimizer.optimizeLineup(lineup, optimizationParams)
        
        console.log(`✅ 最適化完了: ${optimizationResult.improvementPercent.toFixed(2)}%改善`)
        
        return {
          ...baseResult,
          improvementPercent: optimizationResult.improvementPercent,
          optimizationResult
        }
      } catch (error) {
        console.warn('❌ 最適化失敗:', error)
        // 最適化失敗時は基本結果のみ返す
        return baseResult
      }
    }

    const endTime = performance.now()
    const totalExecutionTime = endTime - startTime
    console.log(`🏁 シミュレーション完了 - 総実行時間: ${totalExecutionTime.toFixed(0)}ms`)
    
    return {
      ...baseResult,
      executionTime: totalExecutionTime
    }
  } catch (error) {
    console.error('❌ Simulation failed:', error)
    throw error
  }
}

// ベンチマーク用の軽量シミュレーション（時間計測用）
export const runBenchmark = async (
  lineup: Player[]
): Promise<{ averageTimePerGame: number; totalTime: number }> => {
  const startTime = performance.now()
  const worker = getSimulationWorker()
  
  // 10試合の軽量シミュレーション実行
  const benchmarkParams: SimulationParams = {
    numberOfGames: 10,
    optimizationMethod: 'none',
    maxIterations: 0
  }
  
  try {
    await worker.runSimulation(lineup, benchmarkParams)
    const endTime = performance.now()
    const totalTime = endTime - startTime
    const averageTimePerGame = totalTime / benchmarkParams.numberOfGames
    
    return { averageTimePerGame, totalTime }
  } catch {
    // フォールバック実装
    const scores: number[] = []
    
    for (let i = 0; i < 10; i++) {
      const baseScore = lineup.reduce((total, player, index) => {
        const positionWeight = getPositionWeight(index + 1)
        const playerContribution = (
          player.打率 * 1.0 +
          (player.本塁打 / (player.打席数 || 1)) * 4.0 +
          (player.四球 / (player.打席数 || 1)) * 0.5
        ) * positionWeight
        return total + playerContribution
      }, 0)
      
      const randomFactor = 0.8 + Math.random() * 0.4
      const gameScore = Math.max(0, Math.round((baseScore + Math.random() * 2 - 1) * randomFactor))
      scores.push(gameScore)
      
      await new Promise(resolve => setTimeout(resolve, 1))
    }
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    const averageTimePerGame = totalTime / 10
    
    return { averageTimePerGame, totalTime }
  }
}

// 打順位置による重み（上位打者ほど影響大）
const getPositionWeight = (position: number): number => {
  const weights = [1.2, 1.1, 1.3, 1.25, 1.0, 0.9, 0.8, 0.85, 0.95]
  return weights[position - 1] || 1.0
}