import React, { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { SimulationParams } from '../utils/simulation'
import { theme } from '../styles/atlassian-theme'

interface SimulationParametersProps {
  onStartSimulation: (params: SimulationParams) => void
  isRunning: boolean
}

export const SimulationParameters: React.FC<SimulationParametersProps> = ({
  onStartSimulation,
  isRunning
}) => {
  const [numberOfGames, setNumberOfGames] = useState<string>('1000')
  const [optimizationMethod, setOptimizationMethod] = useState<SimulationParams['optimizationMethod']>('none')
  const [maxIterations, setMaxIterations] = useState<string>('50')

  const handleStartSimulation = () => {
    const params: SimulationParams = {
      numberOfGames: parseInt(numberOfGames) || 1000,
      optimizationMethod,
      maxIterations: parseInt(maxIterations) || 50
    }
    onStartSimulation(params)
  }

  const isValidParams = () => {
    const games = parseInt(numberOfGames)
    const iterations = parseInt(maxIterations)
    return games > 0 && games <= 10000 && iterations > 0 && iterations <= 1000
  }

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
          </div>
        </div>

        {/* 最適化手法 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text
          }}>
            打順最適化
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
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text
            }}>
              最適化反復回数
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

        {/* 実行ボタン */}
        <Button
          variant="primary"
          onClick={handleStartSimulation}
          disabled={isRunning || !isValidParams()}
          style={{ marginTop: theme.spacing.md }}
        >
          {isRunning ? 'シミュレーション実行中...' : 'シミュレーション開始'}
        </Button>

        {/* パラメータ説明 */}
        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle,
            lineHeight: theme.typography.lineHeight.relaxed
          }}>
            <strong>最適化手法:</strong><br />
            • 現在の打順のみ: 指定した打順でシミュレーション<br />
            • ランダム探索: ランダムに打順を変更して探索<br />
            • ヒューリスティック探索: 効率的に最適打順を探索
          </div>
        </div>
      </div>
    </div>
  )
}