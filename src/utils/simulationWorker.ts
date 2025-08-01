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
  console.log(`⚠️ Web Worker使用不可 - フォールバックシミュレーション開始: ${params.numberOfGames}試合`)
  console.log(`🔄 メインスレッドで実際のMonte-Carloシミュレーション実行中...`)
  console.log(`📡 プログレス更新コールバック: ${onProgress ? '有効' : '無効'}`)
  
  const startTime = performance.now()
  
  try {
    // 実際のMonte-Carloシミュレーションをメインスレッドで実行
    const { runMonteCarloSimulation } = await import('../worker/simulator')
    
    console.log(`🎯 Monte-Carloシミュレーション関数インポート成功`)
    const result = await runMonteCarloSimulation(lineup, params, onProgress)
    
    const endTime = performance.now()
    const executionTime = endTime - startTime
    
    console.log(`✅ フォールバックシミュレーション完了: ${executionTime.toFixed(0)}ms`)
    console.log(`📊 フォールバック結果: 平均${result.averageScore.toFixed(2)}点, 範囲${result.minScore}-${result.maxScore}点`)
    
    return {
      ...result,
      executionTime
    }
  } catch (error) {
    console.error('❌ フォールバックでMonte-Carloシミュレーション実行エラー:', error)
    console.error('📝 エラー詳細:', error.stack)
    
    // エラー時は代替のインライン実装を使用
    console.log(`🚨 緊急代替: インラインMonte-Carlo実装を使用`)
    return await runInlineMonteCarloSimulation(lineup, params, onProgress)
  }
}

// インライン Monte-Carlo シミュレーション（フォールバック用）
const runInlineMonteCarloSimulation = async (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<SimulationResult> => {
  const startTime = performance.now()
  console.log(`🎯 インラインMonte-Carloシミュレーション開始: ${params.numberOfGames}試合`)
  
  // 確率テーブル作成
  const probabilityTables = lineup.map(player => {
    const pa = player.打席数 || 1
    const single = Math.max(0, (player.安打 - player.二塁打 - player.三塁打 - player.本塁打)) / pa
    const double = player.二塁打 / pa
    const triple = player.三塁打 / pa
    const homerun = player.本塁打 / pa
    const walk = (player.四球 + player.死球) / pa
    const strikeout = player.三振 / pa
    
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
  })
  
  console.log(`📊 確率テーブル生成完了: ${lineup.length}選手`)
  
  const scores: number[] = []
  // プログレス更新の頻度を調整 (最大1000試合間隔、最小100試合間隔)
  const progressInterval = Math.max(100, Math.min(1000, Math.floor(params.numberOfGames / 100)))
  console.log(`📊 インラインプログレス更新間隔: ${progressInterval}試合ごと`)
  
  for (let game = 0; game < params.numberOfGames; game++) {
    let gameScore = 0
    let batterIndex = 0
    
    // 9イニング
    for (let inning = 0; inning < 9; inning++) {
      let outs = 0
      let runners = 0 // ビット表現: 1塁=1, 2塁=2, 3塁=4
      
      while (outs < 3) {
        const playerProbs = probabilityTables[batterIndex]
        const random = Math.random()
        
        // 累積確率で結果決定
        let cumulative = 0
        let outcome = null
        
        for (const prob of playerProbs) {
          cumulative += prob.probability
          if (random <= cumulative) {
            outcome = prob
            break
          }
        }
        
        if (!outcome) outcome = { type: 'out', probability: 1, bases: 0 }
        
        // 結果処理
        if (outcome.type === 'strikeout' || outcome.type === 'out') {
          outs++
        } else if (outcome.type === 'homerun') {
          // 全走者＋打者得点
          gameScore += 1 + ((runners & 1) ? 1 : 0) + ((runners & 2) ? 1 : 0) + ((runners & 4) ? 1 : 0)
          runners = 0
        } else if (outcome.type === 'triple') {
          // 全走者得点、打者3塁
          gameScore += ((runners & 1) ? 1 : 0) + ((runners & 2) ? 1 : 0) + ((runners & 4) ? 1 : 0)
          runners = 4
        } else if (outcome.type === 'double') {
          // 2,3塁走者得点、1塁走者3塁、打者2塁
          gameScore += ((runners & 2) ? 1 : 0) + ((runners & 4) ? 1 : 0)
          runners = ((runners & 1) ? 4 : 0) | 2
        } else if (outcome.type === 'single' || outcome.type === 'walk') {
          // 3塁走者得点、走者進塁、打者1塁
          gameScore += ((runners & 4) ? 1 : 0)
          runners = ((runners << 1) & 6) | 1
        }
        
        batterIndex = (batterIndex + 1) % 9
      }
    }
    
    scores.push(gameScore)
    
    // デバッグ用：最初の10試合の詳細ログ
    if (game < 10) {
      console.log(`🏆 試合${game + 1}: ${gameScore}点`)
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
  
  console.log(`⏱️ インラインシミュレーション実行時間: ${executionTime.toFixed(0)}ms`)
  console.log(`🎯 全${params.numberOfGames}試合完了`)
  
  // 統計計算
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  
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
    hasDetailedData: false
  }
}

// 緊急時の簡易シミュレーション（最後の手段）
const runLegacySimulation = async (
  lineup: Player[],
  params: SimulationParams,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<SimulationResult> => {
  const startTime = performance.now()
  const scores: number[] = []
  const progressInterval = Math.max(1, Math.floor(params.numberOfGames / 100))

  for (let i = 0; i < params.numberOfGames; i++) {
    // 簡易的な得点計算（緊急時のみ）
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
    executionTime,
    hasDetailedData: false
  }
}

// 打順位置による重み（上位打者ほど影響大）
const getPositionWeight = (position: number): number => {
  const weights = [1.2, 1.1, 1.3, 1.25, 1.0, 0.9, 0.8, 0.85, 0.95]
  return weights[position - 1] || 1.0
}