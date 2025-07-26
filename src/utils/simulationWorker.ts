// Web Workerを使ったシミュレーション実行ユーティリティ
import { Player } from '../types/Player'
import { 
  SimulationParams, 
  SimulationResult, 
  SimulationMessage, 
  SimulationRequest,
  ProgressUpdate 
} from '../worker/simulator'

export interface SimulationWorkerOptions {
  onProgress?: (progress: ProgressUpdate) => void
  onComplete?: (result: SimulationResult) => void
  onError?: (error: string) => void
}

export class SimulationWorker {
  private worker: Worker | null = null
  private isRunning = false

  constructor() {
    this.initWorker()
  }

  private initWorker() {
    try {
      // Web WorkerのURLを作成
      const workerUrl = new URL('../worker/simulator.ts', import.meta.url)
      this.worker = new Worker(workerUrl, { type: 'module' })
    } catch (error) {
      console.error('Failed to create Web Worker:', error)
      this.worker = null
    }
  }

  async runSimulation(
    lineup: Player[],
    params: SimulationParams,
    options?: SimulationWorkerOptions
  ): Promise<SimulationResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Web Worker not available'))
        return
      }

      if (this.isRunning) {
        reject(new Error('Simulation already running'))
        return
      }

      this.isRunning = true

      const handleMessage = (event: MessageEvent<SimulationMessage>) => {
        const { type, payload } = event.data

        switch (type) {
          case 'progress':
            options?.onProgress?.(payload as ProgressUpdate)
            break
            
          case 'complete':
            this.isRunning = false
            const result = payload as SimulationResult
            options?.onComplete?.(result)
            resolve(result)
            this.worker!.removeEventListener('message', handleMessage)
            break
            
          case 'error':
            this.isRunning = false
            const errorMessage = payload as string
            options?.onError?.(errorMessage)
            reject(new Error(errorMessage))
            this.worker!.removeEventListener('message', handleMessage)
            break
        }
      }

      this.worker.addEventListener('message', handleMessage)

      // シミュレーション開始
      const request: SimulationRequest = { lineup, params }
      this.worker.postMessage(request)
    })
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.isRunning = false
  }

  get isSimulationRunning(): boolean {
    return this.isRunning
  }
}

// シングルトンインスタンス
let workerInstance: SimulationWorker | null = null

export const getSimulationWorker = (): SimulationWorker => {
  if (!workerInstance) {
    workerInstance = new SimulationWorker()
  }
  return workerInstance
}

// クリーンアップ関数
export const terminateSimulationWorker = () => {
  if (workerInstance) {
    workerInstance.terminate()
    workerInstance = null
  }
}

// フォールバック: Web Workerが使用できない場合のメインスレッド実行
export const runSimulationFallback = async (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<SimulationResult> => {
  console.log(`📝 フォールバックシミュレーション開始: ${params.numberOfGames}試合`)
  
  // メインスレッドでのシミュレーション実装（簡易版）
  const startTime = performance.now()
  const scores: number[] = []
  const progressInterval = Math.max(1, Math.floor(params.numberOfGames / 100))

  for (let i = 0; i < params.numberOfGames; i++) {
    // 簡易的な得点計算（現在のutils/simulation.tsと同様）
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

    // プログレス更新
    if (onProgress && (i + 1) % progressInterval === 0) {
      const currentAverage = scores.reduce((a, b) => a + b, 0) / scores.length
      const progress = (i + 1) / params.numberOfGames
      
      onProgress({
        completedGames: i + 1,
        totalGames: params.numberOfGames,
        progress,
        currentAverage
      })
    }

    // UIブロッキングを防ぐため
    if (i % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1))
    }
  }

  const endTime = performance.now()
  const executionTime = endTime - startTime
  console.log(`📝 フォールバックシミュレーション完了: ${executionTime.toFixed(0)}ms`)

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  console.log(`📊 フォールバック結果: 平均${averageScore.toFixed(2)}点, 範囲${minScore}-${maxScore}点`)

  return {
    averageScore,
    variance,
    standardDeviation,
    minScore,
    maxScore,
    totalGames: params.numberOfGames,
    scores,
    executionTime
  }
}

// 打順位置による重み（上位打者ほど影響大）
const getPositionWeight = (position: number): number => {
  const weights = [1.2, 1.1, 1.3, 1.25, 1.0, 0.9, 0.8, 0.85, 0.95]
  return weights[position - 1] || 1.0
}