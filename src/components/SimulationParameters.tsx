import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Tooltip, InfoIcon } from './Tooltip'
import { SimulationParams, runBenchmark } from '../utils/simulation'
import { Player } from '../types/Player'
import { theme } from '../styles/atlassian-theme'

interface SimulationParametersProps {
  onStartSimulation: (params: SimulationParams) => void
  isRunning: boolean
  selectedPlayers: Player[]
}

export const SimulationParameters: React.FC<SimulationParametersProps> = ({
  onStartSimulation,
  isRunning,
  selectedPlayers
}) => {
  const [numberOfGames, setNumberOfGames] = useState<string>('1000')
  const [optimizationMethod, setOptimizationMethod] = useState<SimulationParams['optimizationMethod']>('none')
  const [maxIterations, setMaxIterations] = useState<string>('50')
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  const [benchmarkResult, setBenchmarkResult] = useState<{ averageTimePerGame: number; totalTime: number } | null>(null)
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false)
  const [estimatedTime, setEstimatedTime] = useState<string>('')

  const handleStartSimulation = () => {
    const params: SimulationParams = {
      numberOfGames: showDetailedView ? 1 : (parseInt(numberOfGames) || 1000),
      optimizationMethod: showDetailedView ? 'none' : optimizationMethod,
      maxIterations: parseInt(maxIterations) || 50,
      showDetailedView
    }
    onStartSimulation(params)
  }

  const isValidParams = () => {
    const games = parseInt(numberOfGames)
    const iterations = parseInt(maxIterations)
    return games > 0 && games <= 10000 && iterations > 0 && iterations <= 1000
  }

  const runBenchmarkTest = async () => {
    if (selectedPlayers.length !== 9) return
    
    setIsBenchmarking(true)
    try {
      const result = await runBenchmark(selectedPlayers)
      setBenchmarkResult(result)
      console.log('Benchmark result:', result)
    } catch (error) {
      console.error('Benchmark failed:', error)
    } finally {
      setIsBenchmarking(false)
    }
  }

  // 想定時間の計算
  useEffect(() => {
    if (!benchmarkResult) {
      setEstimatedTime('')
      return
    }
    
    const games = parseInt(numberOfGames) || 0
    if (games <= 0) {
      setEstimatedTime('')
      return
    }
    
    const baseTime = (benchmarkResult.averageTimePerGame * games) / 1000 // 秒単位
    const iterations = optimizationMethod === 'none' ? 1 : parseInt(maxIterations) || 1
    const totalTime = baseTime * iterations
    
    if (totalTime < 1) {
      setEstimatedTime(`約 ${Math.round(totalTime * 1000)}ms`)
    } else if (totalTime < 60) {
      setEstimatedTime(`約 ${totalTime.toFixed(1)}秒`)
    } else {
      const minutes = Math.floor(totalTime / 60)
      const seconds = Math.round(totalTime % 60)
      setEstimatedTime(`約 ${minutes}分${seconds > 0 ? seconds + '秒' : ''}`)
    }
  }, [numberOfGames, maxIterations, optimizationMethod, benchmarkResult])

  return (
    <div style={{
      width: '300px',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      <h3 style={{
        margin: `0 0 ${theme.spacing.xl} 0`,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text,
        fontWeight: theme.typography.fontWeight.semibold,
        textAlign: 'center'
      }}>
        実験設定
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* ベンチマークテスト */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text
          }}>
            パフォーマンステスト
          </label>
          <Button
            variant="secondary"
            onClick={runBenchmarkTest}
            disabled={selectedPlayers.length !== 9 || isBenchmarking || isRunning}
            style={{ width: '100%' }}
          >
            {isBenchmarking ? '10試合テスト中...' : '10試合で時間計測'}
          </Button>
          {benchmarkResult && (
            <div style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.success,
              textAlign: 'center'
            }}>
              ✓ 1試合当たり約{benchmarkResult.averageTimePerGame.toFixed(1)}ms
            </div>
          )}
        </div>

        {/* 試合数設定 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text
          }}>
            試合数
          </label>
          <Input
            type="number"
            value={numberOfGames}
            onChange={(e) => setNumberOfGames(e.target.value)}
            placeholder="1000"
            disabled={isRunning}
          />
          <div style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle
          }}>
            1〜10,000試合
            {estimatedTime && (
              <span style={{ color: theme.colors.primary, fontWeight: theme.typography.fontWeight.medium }}>
                {' '}(予想: {estimatedTime})
              </span>
            )}
          </div>
        </div>

        {/* 最適化手法 */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text
          }}>
            打順最適化
            <Tooltip
              content={
                <div>
                  <div>・ 現在の打順のみ: 指定した打順でシミュレーション</div>
                  <div>・ ランダム探索: ランダムに打順を変更して探索</div>
                  <div>・ ヒューリスティック探索: 効率的に最適打順を探索</div>
                </div>
              }
              position="right"
            >
              <InfoIcon size="sm" />
            </Tooltip>
          </label>
          <select
            value={optimizationMethod}
            onChange={(e) => setOptimizationMethod(e.target.value as SimulationParams['optimizationMethod'])}
            disabled={isRunning}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.typography.fontSize.base,
              borderRadius: theme.borderRadius.sm,
              border: `2px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              outline: 'none'
            }}
          >
            <option value="none">現在の打順のみ</option>
            <option value="random">ランダム探索</option>
            <option value="heuristic">ヒューリスティック探索</option>
          </select>
        </div>

        {/* 最適化反復回数 */}
        {optimizationMethod !== 'none' && (
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text
            }}>
              最適化反復回数
              <Tooltip
                content="最適化アルゴリズムを実行する回数。多いほどより良い結果が得られる可能性がありますが、時間がかかります。"
                position="right"
              >
                <InfoIcon size="sm" />
              </Tooltip>
            </label>
            <Input
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(e.target.value)}
              placeholder="50"
              disabled={isRunning}
            />
            <div style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle
            }}>
              1〜1,000回
            </div>
          </div>
        )}

        {/* 詳細表示オプション */}
        <div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text,
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={showDetailedView}
              onChange={(e) => setShowDetailedView(e.target.checked)}
              disabled={isRunning}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            詳細表示モード
            <Tooltip
              content="1試合分の全打席結果を詳細に表示します。試合数は自動的に1試合に変更されます。"
              position="right"
            >
              <InfoIcon size="sm" />
            </Tooltip>
          </label>
          {showDetailedView && (
            <div style={{
              marginTop: theme.spacing.xs,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.warningLight,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.warning}`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.warning
            }}>
              ⚠️ 詳細表示モードでは1試合のみ実行されます
            </div>
          )}
        </div>

        {/* 実行ボタン */}
        <Button
          variant="primary"
          onClick={handleStartSimulation}
          disabled={isRunning || !isValidParams() || !benchmarkResult}
          style={{ marginTop: theme.spacing.md }}
        >
          {isRunning ? 'シミュレーション実行中...' : 'シミュレーション開始'}
        </Button>
        {!benchmarkResult && (
          <div style={{
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.warning,
            textAlign: 'center'
          }}>
            パフォーマンステストを実行してください
          </div>
        )}

        {/* 注意書き */}
        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs
        }}>
          <InfoIcon size="sm" />
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle
          }}>
            パフォーマンステスト結果に基づく時間予想です。
          </div>
        </div>
      </div>
    </div>
  )
}