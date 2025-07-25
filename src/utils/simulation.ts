import { Player } from '../types/Player'
import { SimulationResult } from '../components/SimulationResults'

export interface SimulationParams {
  numberOfGames: number
  optimizationMethod: 'none' | 'random' | 'heuristic'
  maxIterations: number
}

// 簡易的なシミュレーション関数（実際のMonte-Carlo実装は後で置き換え）
export const runSimulation = async (
  lineup: Player[],
  params: SimulationParams
): Promise<SimulationResult> => {
  // シミュレーション実行の遅延（実際の処理時間を模擬）
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 各選手の基本能力から期待得点を計算（簡易版）
  const baseScore = lineup.reduce((total, player, index) => {
    const positionWeight = getPositionWeight(index + 1)
    const playerContribution = (
      player.打率 * 1.0 +
      (player.本塁打 / (player.打席数 || 1)) * 4.0 +
      (player.四球 / (player.打席数 || 1)) * 0.5
    ) * positionWeight
    return total + playerContribution
  }, 0)

  // ランダムな変動を加えた結果を生成
  const scores: number[] = []
  for (let i = 0; i < params.numberOfGames; i++) {
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8-1.2の範囲
    const gameScore = Math.max(0, Math.round((baseScore + Math.random() * 2 - 1) * randomFactor))
    scores.push(gameScore)
  }

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  let improvementPercent: number | undefined
  if (params.optimizationMethod !== 'none') {
    // 最適化による改善をシミュレート
    const improvementFactor = params.optimizationMethod === 'heuristic' ? 0.03 : 0.01
    improvementPercent = (Math.random() * improvementFactor * 100) - (improvementFactor * 50)
  }

  return {
    averageScore,
    variance,
    standardDeviation,
    minScore,
    maxScore,
    totalGames: params.numberOfGames,
    improvementPercent
  }
}

// 打順位置による重み（上位打者ほど影響大）
const getPositionWeight = (position: number): number => {
  const weights = [1.2, 1.1, 1.3, 1.25, 1.0, 0.9, 0.8, 0.85, 0.95]
  return weights[position - 1] || 1.0
}