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
}

// 統合されたシミュレーション実行関数
export const runSimulation = async (
  lineup: Player[],
  params: SimulationParams
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
    
    if (worker.isSimulationRunning) {
      console.log('⚠️ Web Worker使用中 - フォールバック使用')
      baseResult = await runSimulationFallback(lineup, params)
    } else {
      try {
        console.log('🔄 Web Workerでシミュレーション実行中...')
        baseResult = await worker.runSimulation(lineup, params)
        console.log('✅ Web Workerシミュレーション完了:', baseResult)
      } catch (error) {
        console.warn('❌ Web Worker simulation failed, using fallback:', error)
        baseResult = await runSimulationFallback(lineup, params)
        console.log('✅ フォールバックシミュレーション完了:', baseResult)
      }
    }

    // 最適化実行（必要な場合）
    if (params.optimizationMethod !== 'none') {
      const optimizer = createOptimizer(params.optimizationMethod)
      
      try {
        const optimizationResult = await optimizer.optimizeLineup(lineup, params)
        
        return {
          ...baseResult,
          improvementPercent: optimizationResult.improvementPercent,
          optimizationResult
        }
      } catch (error) {
        console.warn('Optimization failed:', error)
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
  } catch (error) {
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