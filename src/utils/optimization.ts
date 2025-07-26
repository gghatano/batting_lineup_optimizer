// ヒューリスティック最適化アルゴリズム
import { Player } from '../types/Player'
import { SimulationParams, SimulationResult } from '../worker/simulator'
import { getSimulationWorker, runSimulationFallback } from './simulationWorker'

export interface OptimizationResult {
  originalLineup: Player[]
  optimizedLineup: Player[]
  originalScore: number
  optimizedScore: number
  improvementPercent: number
  iterations: number
  executionTime: number
  iterationHistory: OptimizationIteration[]
}

export interface OptimizationIteration {
  iteration: number
  lineup: Player[]
  averageScore: number
  improvement: number
  swapPositions?: [number, number]
}

export interface OptimizationProgress {
  currentIteration: number
  totalIterations: number
  bestScore: number
  currentScore: number
  improvementPercent: number
  noImprovementCount: number
}

// ヒューリスティック最適化クラス
export class LineupOptimizer {
  private worker = getSimulationWorker()
  private _isOptimizing = false

  async optimizeLineup(
    originalLineup: Player[],
    params: SimulationParams,
    onProgress?: (progress: OptimizationProgress) => void
  ): Promise<OptimizationResult> {
    if (this._isOptimizing) {
      throw new Error('Optimization already in progress')
    }

    this._isOptimizing = true
    const startTime = performance.now()

    try {
      // 元の打順の評価
      const originalResult = await this.evaluateLineup(originalLineup, params)
      const originalScore = originalResult.averageScore

      let currentLineup = [...originalLineup]
      let bestLineup = [...originalLineup]
      let bestScore = originalScore
      let noImprovementCount = 0
      const iterationHistory: OptimizationIteration[] = []

      // 初期状態を記録
      iterationHistory.push({
        iteration: 0,
        lineup: [...originalLineup],
        averageScore: originalScore,
        improvement: 0
      })

      for (let iteration = 1; iteration <= params.maxIterations; iteration++) {
        // 近隣解の生成（1箇所入れ替え）
        const { newLineup, swapPositions } = this.generateNeighbor(currentLineup, iteration)
        
        // 新しい打順の評価
        const newResult = await this.evaluateLineup(newLineup, params)
        const newScore = newResult.averageScore

        const improvement = newScore - bestScore
        const isImprovement = improvement > 0

        // 記録
        iterationHistory.push({
          iteration,
          lineup: [...newLineup],
          averageScore: newScore,
          improvement,
          swapPositions
        })

        // 改善があった場合は採用
        if (isImprovement) {
          currentLineup = newLineup
          bestLineup = [...newLineup]
          bestScore = newScore
          noImprovementCount = 0
        } else {
          noImprovementCount++
        }

        // プログレス更新
        if (onProgress) {
          const improvementPercent = ((bestScore - originalScore) / originalScore) * 100
          onProgress({
            currentIteration: iteration,
            totalIterations: params.maxIterations,
            bestScore,
            currentScore: newScore,
            improvementPercent,
            noImprovementCount
          })
        }

        // 終了条件：10回連続改善なし
        if (noImprovementCount >= 10) {
          console.log(`Optimization stopped early at iteration ${iteration} (no improvement for 10 iterations)`)
          break
        }
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime
      const improvementPercent = ((bestScore - originalScore) / originalScore) * 100

      this._isOptimizing = false

      return {
        originalLineup,
        optimizedLineup: bestLineup,
        originalScore,
        optimizedScore: bestScore,
        improvementPercent,
        iterations: iterationHistory.length - 1,
        executionTime,
        iterationHistory
      }
    } catch (error) {
      this._isOptimizing = false
      throw error
    }
  }

  private async evaluateLineup(lineup: Player[], params: SimulationParams): Promise<SimulationResult> {
    // 最適化用には少ない試合数で評価（高速化）
    const evaluationParams: SimulationParams = {
      ...params,
      numberOfGames: Math.min(params.numberOfGames, 1000) // 最大1000試合で評価
    }

    try {
      return await this.worker.runSimulation(lineup, evaluationParams)
    } catch (error) {
      // Web Worker失敗時はフォールバック
      console.warn('Web Worker failed, using fallback simulation')
      return await runSimulationFallback(lineup, evaluationParams)
    }
  }

  private generateNeighbor(lineup: Player[], iteration: number): { newLineup: Player[], swapPositions: [number, number] } {
    const newLineup = [...lineup]
    
    // 近隣・遠隔入れ替え方法の選択
    const useRemoteSwap = iteration % 5 === 0 // 5回に1回は遠隔入れ替え
    
    let pos1: number, pos2: number

    if (useRemoteSwap) {
      // 遠隔入れ替え：離れた位置の選手を入れ替え
      pos1 = Math.floor(Math.random() * 9)
      do {
        pos2 = Math.floor(Math.random() * 9)
      } while (Math.abs(pos1 - pos2) < 3) // 最低3つ離れた位置
    } else {
      // 近隣入れ替え：隣接する選手を入れ替え
      pos1 = Math.floor(Math.random() * 8) // 0-7
      pos2 = pos1 + 1 // 隣接位置
    }

    // 位置を交換（境界チェック）
    if (pos1 < newLineup.length && pos2 < newLineup.length && 
        pos1 >= 0 && pos2 >= 0) {
      const temp = newLineup[pos1]!
      newLineup[pos1] = newLineup[pos2]!
      newLineup[pos2] = temp
    }

    return { newLineup, swapPositions: [pos1, pos2] }
  }

  get isOptimizing(): boolean {
    return this._isOptimizing
  }

  terminate() {
    this.worker.terminate()
  }
}

// ランダム最適化（比較用）
export class RandomOptimizer {
  private worker = getSimulationWorker()

  async optimizeLineup(
    originalLineup: Player[],
    params: SimulationParams,
    onProgress?: (progress: OptimizationProgress) => void
  ): Promise<OptimizationResult> {
    const startTime = performance.now()

    // 元の打順の評価
    const originalResult = await this.evaluateLineup(originalLineup, params)
    const originalScore = originalResult.averageScore

    let bestLineup = [...originalLineup]
    let bestScore = originalScore
    const iterationHistory: OptimizationIteration[] = []

    // 初期状態を記録
    iterationHistory.push({
      iteration: 0,
      lineup: [...originalLineup],
      averageScore: originalScore,
      improvement: 0
    })

    for (let iteration = 1; iteration <= params.maxIterations; iteration++) {
      // ランダムに打順をシャッフル
      const newLineup = [...originalLineup].sort(() => Math.random() - 0.5)
      
      // 評価
      const newResult = await this.evaluateLineup(newLineup, params)
      const newScore = newResult.averageScore
      const improvement = newScore - bestScore

      // 記録
      iterationHistory.push({
        iteration,
        lineup: [...newLineup],
        averageScore: newScore,
        improvement
      })

      // 改善があった場合は採用
      if (improvement > 0) {
        bestLineup = [...newLineup]
        bestScore = newScore
      }

      // プログレス更新
      if (onProgress) {
        const improvementPercent = ((bestScore - originalScore) / originalScore) * 100
        onProgress({
          currentIteration: iteration,
          totalIterations: params.maxIterations,
          bestScore,
          currentScore: newScore,
          improvementPercent,
          noImprovementCount: 0
        })
      }
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime
    const improvementPercent = ((bestScore - originalScore) / originalScore) * 100

    return {
      originalLineup,
      optimizedLineup: bestLineup,
      originalScore,
      optimizedScore: bestScore,
      improvementPercent,
      iterations: params.maxIterations,
      executionTime,
      iterationHistory
    }
  }

  private async evaluateLineup(lineup: Player[], params: SimulationParams): Promise<SimulationResult> {
    const evaluationParams: SimulationParams = {
      ...params,
      numberOfGames: Math.min(params.numberOfGames, 1000)
    }

    try {
      return await this.worker.runSimulation(lineup, evaluationParams)
    } catch (error) {
      return await runSimulationFallback(lineup, evaluationParams)
    }
  }
}

// ファクトリー関数
export const createOptimizer = (method: 'heuristic' | 'random'): LineupOptimizer | RandomOptimizer => {
  switch (method) {
    case 'heuristic':
      return new LineupOptimizer()
    case 'random':
      return new RandomOptimizer()
    default:
      throw new Error(`Unknown optimization method: ${method}`)
  }
}