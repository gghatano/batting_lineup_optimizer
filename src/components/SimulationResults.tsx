import React from 'react'
import { Badge } from './Badge'
import { theme } from '../styles/atlassian-theme'

export interface SimulationResult {
  averageScore: number
  variance: number
  standardDeviation: number
  minScore: number
  maxScore: number
  totalGames: number
  optimizedLineup?: string[]
  improvementPercent?: number
}

interface SimulationResultsProps {
  result: SimulationResult | null
  isRunning: boolean
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  isRunning
}) => {
  if (isRunning) {
    return (
      <div style={{
        flex: 1,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: theme.spacing.xl,
          textAlign: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${theme.colors.border}`,
            borderRadius: '50%',
            borderTopColor: theme.colors.primary,
            animation: 'spin 1s ease-in-out infinite',
            margin: `0 auto ${theme.spacing.lg} auto`
          }} />
          <div style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            シミュレーション実行中...
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.textSubtle,
            marginTop: theme.spacing.sm
          }}>
            Monte-Carlo シミュレーションを実行しています
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{
        flex: 1,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: theme.colors.textSubtle
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.xl,
            marginBottom: theme.spacing.md
          }}>
            📊
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            シミュレーション結果
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.base,
            marginTop: theme.spacing.sm
          }}>
            実験パラメータを設定してシミュレーションを開始してください
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text,
          fontWeight: theme.typography.fontWeight.semibold
        }}>
          シミュレーション結果
        </h3>
        <Badge variant="success" size="sm">
          {result.totalGames.toLocaleString()}試合完了
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* 主要指標 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: theme.spacing.md
        }}>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.sm,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.xxl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary
            }}>
              {result.averageScore.toFixed(2)}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle,
              marginTop: theme.spacing.xs
            }}>
              平均得点
            </div>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.sm,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text
            }}>
              {result.standardDeviation.toFixed(2)}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle,
              marginTop: theme.spacing.xs
            }}>
              標準偏差
            </div>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.sm,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text
            }}>
              {result.minScore} - {result.maxScore}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle,
              marginTop: theme.spacing.xs
            }}>
              得点範囲
            </div>
          </div>
        </div>

        {/* 最適化結果 */}
        {result.improvementPercent !== undefined && (
          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: result.improvementPercent > 0 ? theme.colors.successLight : theme.colors.background,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${result.improvementPercent > 0 ? theme.colors.success : theme.colors.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md,
              marginBottom: theme.spacing.sm
            }}>
              <span style={{
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text
              }}>
                打順最適化結果
              </span>
              <Badge 
                variant={result.improvementPercent > 0 ? 'success' : 'default'}
                size="sm"
              >
                {result.improvementPercent > 0 ? '+' : ''}{result.improvementPercent.toFixed(1)}%
              </Badge>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle
            }}>
              {result.improvementPercent > 0 
                ? '最適化により平均得点が向上しました' 
                : '現在の打順が最適に近い結果です'
              }
            </div>
          </div>
        )}

        {/* 簡易可視化 */}
        <div style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md
          }}>
            得点分布（簡易表示）
          </div>
          
          {/* 簡易ヒストグラム */}
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '2px',
            height: '80px',
            marginBottom: theme.spacing.md
          }}>
            {Array.from({ length: 20 }, (_, i) => {
              const height = Math.random() * 80 + 10 // サンプル表示
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${height}px`,
                    backgroundColor: theme.colors.primary,
                    opacity: 0.7,
                    borderRadius: '2px 2px 0 0'
                  }}
                />
              )
            })}
          </div>
          
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle,
            textAlign: 'center'
          }}>
            得点分布の概形（実装予定: Chart.js による詳細グラフ）
          </div>
        </div>

        {/* 統計詳細 */}
        <div style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.md
          }}>
            統計詳細
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle
          }}>
            <div>分散: {result.variance.toFixed(3)}</div>
            <div>試行回数: {result.totalGames.toLocaleString()}回</div>
            <div>信頼区間: 95%</div>
            <div>計算時間: 推定値</div>
          </div>
        </div>
      </div>
    </div>
  )
}