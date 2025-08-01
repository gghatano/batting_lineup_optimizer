import React from 'react'
import { Badge } from './Badge'
import { ProgressBar } from './ProgressBar'
import { theme } from '../styles/atlassian-theme'
import { GameDetail } from '../types/GameDetail'
import { VisualizationTabs } from './VisualizationTabs'
import { calculateStatistics, calculatePercentile } from '../utils/statistics'

export interface SimulationResult {
  averageScore: number
  variance: number
  standardDeviation: number
  minScore: number
  maxScore: number
  totalGames: number
  optimizedLineup?: string[]
  improvementPercent?: number
  scores?: number[]
  executionTime?: number
  gameDetail?: GameDetail
}

interface SimulationResultsProps {
  result: SimulationResult | null
  isRunning: boolean
  progress?: {
    progress: number
    completedGames: number
    totalGames: number
    currentAverage: number
    estimatedTimeRemaining: number
  }
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  isRunning,
  progress
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
        flexDirection: 'column'
      }}>
        <h3 style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text,
          fontWeight: theme.typography.fontWeight.semibold
        }}>
          シミュレーション結果
        </h3>
        
        <div style={{ 
          height: '80px', 
          marginBottom: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center'
        }}>
          {progress ? (
            <div style={{ width: '100%' }}>
              <ProgressBar
                progress={progress.progress}
                total={progress.totalGames}
                completed={progress.completedGames}
                currentAverage={progress.currentAverage}
                estimatedTimeRemaining={progress.estimatedTimeRemaining}
              />
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              border: `1px dashed ${theme.colors.border}`,
              color: theme.colors.textSubtle,
              fontSize: theme.typography.fontSize.sm
            }}>
              シミュレーション開始前
            </div>
          )}
        </div>
        
        <div style={{
          flex: 1,
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
        flexDirection: 'column'
      }}>
        <h3 style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text,
          fontWeight: theme.typography.fontWeight.semibold
        }}>
          シミュレーション結果
        </h3>
        
        <div style={{ 
          height: '80px', 
          marginBottom: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center'
        }}>
          {progress ? (
            <div style={{ width: '100%' }}>
              <ProgressBar
                progress={progress.progress}
                total={progress.totalGames}
                completed={progress.completedGames}
                currentAverage={progress.currentAverage}
                estimatedTimeRemaining={progress.estimatedTimeRemaining}
              />
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              border: `1px dashed ${theme.colors.border}`,
              color: theme.colors.textSubtle,
              fontSize: theme.typography.fontSize.sm
            }}>
              シミュレーション開始前
            </div>
          )}
        </div>
        
        <div style={{
          flex: 1,
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
              {!progress || progress.progress === 0 ? 'シミュレーション結果' : '実行完了'}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.base,
              marginTop: theme.spacing.sm
            }}>
              {!progress || progress.progress === 0 
                ? '実験パラメータを設定してシミュレーションを開始してください'
                : 'シミュレーションが完了しました'
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 詳細表示モードの場合
  if (result.gameDetail) {
    return (
      <div style={{
        flex: 1,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            <h3 style={{
              margin: 0,
              fontSize: theme.typography.fontSize.lg,
              color: theme.colors.text,
              fontWeight: theme.typography.fontWeight.semibold
            }}>
              ⚾ 詳細試合記録
            </h3>
            <Badge variant="primary" size="md">
              最終得点: {result.gameDetail.finalScore}点
            </Badge>
          </div>
          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle,
            display: 'flex',
            gap: theme.spacing.lg
          }}>
            <span>総打席数: {result.gameDetail.totalAtBats}</span>
            <span>試合時間: {result.gameDetail.gameTime.toFixed(0)}ms</span>
          </div>
        </div>
        
        <div style={{ 
          height: '80px', 
          marginBottom: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center'
        }}>
          {progress ? (
            <div style={{ width: '100%' }}>
              <ProgressBar
                progress={progress.progress}
                total={progress.totalGames}
                completed={progress.completedGames}
                currentAverage={progress.currentAverage}
                estimatedTimeRemaining={progress.estimatedTimeRemaining}
              />
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              border: `1px dashed ${theme.colors.border}`,
              color: theme.colors.textSubtle,
              fontSize: theme.typography.fontSize.sm
            }}>
              シミュレーション開始前
            </div>
          )}
        </div>
        
        {/* 詳細試合記録 - メイン表示 */}
        <div style={{
          flex: 1,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.sm,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            overflowY: 'auto'
          }}>
            {result.gameDetail.innings.map((inning, inningIndex) => (
              <div key={inningIndex} style={{
                borderBottom: inningIndex < result.gameDetail!.innings.length - 1 ? `1px solid ${theme.colors.border}` : 'none'
              }}>
                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.secondary,
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.bold,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{inning.inning}回</span>
                  <span>{inning.runs}得点</span>
                </div>
                
                {inning.atBats.map((atBat, atBatIndex) => (
                  <div key={atBatIndex} style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderBottom: atBatIndex < inning.atBats.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    fontSize: theme.typography.fontSize.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    backgroundColor: atBat.runs > 0 ? theme.colors.successLight : 'transparent'
                  }}>
                    <div style={{ 
                      minWidth: '50px',
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.primary
                    }}>
                      {atBat.batterPosition}番
                    </div>
                    <div style={{ 
                      minWidth: '100px',
                      fontWeight: theme.typography.fontWeight.medium
                    }}>
                      {atBat.batter.選手名}
                    </div>
                    <div style={{ 
                      minWidth: '60px',
                      color: theme.colors.textSubtle
                    }}>
                      {atBat.outs}アウト
                    </div>
                    <div style={{ 
                      minWidth: '70px',
                      fontWeight: theme.typography.fontWeight.bold,
                      color: atBat.result === 'homerun' ? theme.colors.warning :
                            atBat.result === 'triple' ? '#9B59B6' :
                            atBat.result === 'double' ? '#3498DB' :
                            atBat.result === 'single' ? theme.colors.success :
                            atBat.result === 'walk' || atBat.result === 'hbp' ? '#F39C12' :
                            theme.colors.danger
                    }}>
                      {atBat.description}
                    </div>
                    <div style={{ 
                      minWidth: '100px',
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.textSubtle
                    }}>
                      {atBat.runnersAfter}
                    </div>
                    {atBat.runs > 0 && (
                      <div style={{
                        marginLeft: 'auto',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: theme.colors.success,
                        color: theme.colors.secondary,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.bold
                      }}>
                        +{atBat.runs}点
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 通常のシミュレーション結果表示
  return (
    <div style={{
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ヘッダー（固定） */}
      <div style={{
        padding: theme.spacing.xl,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface
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
        
        <div style={{ 
          height: '80px',
          marginBottom: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center'
        }}>
          {progress && progress.progress >= 1.0 ? (
            <div style={{ 
              width: '100%', 
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.successLight,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.success}`,
              color: theme.colors.success,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              ✅ {progress.totalGames.toLocaleString()}試合完了
            </div>
          ) : progress && progress.progress > 0 ? (
            <div style={{ width: '100%' }}>
              <ProgressBar
                progress={progress.progress}
                total={progress.totalGames}
                completed={progress.completedGames}
                currentAverage={progress.currentAverage}
                estimatedTimeRemaining={progress.estimatedTimeRemaining}
              />
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              border: `1px dashed ${theme.colors.border}`,
              color: theme.colors.textSubtle,
              fontSize: theme.typography.fontSize.sm
            }}>
              シミュレーション開始前
            </div>
          )}
        </div>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.xl
      }}>

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

        {/* Chart.js による可視化（タブ形式） */}
        {result.scores && result.scores.length > 1 && (
          <div style={{
            height: '450px', // 固定高さでスクロール対応
            marginBottom: theme.spacing.lg
          }}>
            <VisualizationTabs
              scores={result.scores}
              minScore={result.minScore}
              maxScore={result.maxScore}
              averageScore={result.averageScore}
              improvementPercent={result.improvementPercent}
            />
          </div>
        )}

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
            📈 統計詳細
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: theme.spacing.md,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle
          }}>
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text }}>
                基本統計
              </div>
              <div>分散: {result.variance.toFixed(3)}</div>
              <div>標準偏差: {result.standardDeviation.toFixed(3)}</div>
              {result.scores && (
                <div>中央値: {calculatePercentile(result.scores, 50).toFixed(2)}</div>
              )}
            </div>
            
            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text }}>
                実行情報
              </div>
              <div>試行回数: {result.totalGames.toLocaleString()}回</div>
              <div>計算時間: {result.executionTime ? `${result.executionTime.toFixed(0)}ms` : '未計測'}</div>
              <div>1試合あたり: {result.executionTime && result.totalGames ? `${(result.executionTime / result.totalGames).toFixed(2)}ms` : '未計測'}</div>
            </div>

            {result.scores && result.scores.length > 10 && (
              <div style={{
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text }}>
                  パーセンタイル
                </div>
                <div>90%tile: {calculatePercentile(result.scores, 90).toFixed(2)}</div>
                <div>95%tile: {calculatePercentile(result.scores, 95).toFixed(2)}</div>
                <div>99%tile: {calculatePercentile(result.scores, 99).toFixed(2)}</div>
              </div>
            )}

            <div style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text }}>
                信頼性
              </div>
              <div>信頼区間: 95%</div>
              {result.scores && (() => {
                const stats = calculateStatistics(result.scores)
                const margin = 1.96 * (result.standardDeviation / Math.sqrt(result.totalGames))
                return (
                  <>
                    <div>下限: {(result.averageScore - margin).toFixed(2)}</div>
                    <div>上限: {(result.averageScore + margin).toFixed(2)}</div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}