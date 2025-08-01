import React, { useState } from 'react'
import { Player } from '../types/Player'
import { theme } from '../styles/atlassian-theme'
import { Badge } from './Badge'
import { Button } from './Button'

export interface HistoryEntry {
  id: string
  timestamp: Date
  lineup: Player[]
  averageScore: number
  totalGames: number
  executionTime: number
  optimizationMethod: 'none' | 'random' | 'heuristic'
  improvementPercent?: number
  isOptimal?: boolean
}

interface HistoryGridProps {
  history: HistoryEntry[]
  onLoadLineup: (lineup: Player[]) => void
  onClearHistory: () => void
  onDeleteEntry: (id: string) => void
}

export const HistoryGrid: React.FC<HistoryGridProps> = ({
  history,
  onLoadLineup,
  onClearHistory,
  onDeleteEntry
}) => {
  const [sortField, setSortField] = useState<keyof HistoryEntry>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterOptimized, setFilterOptimized] = useState<boolean>(false)

  // 履歴のソート
  const sortedHistory = [...history].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    if (sortField === 'timestamp') {
      aValue = (a.timestamp as Date).getTime()
      bValue = (b.timestamp as Date).getTime()
    } else if (sortField === 'lineup') {
      aValue = a.lineup.map(p => p.選手名).join('-')
      bValue = b.lineup.map(p => p.選手名).join('-')
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // フィルタリング
  const filteredHistory = filterOptimized 
    ? sortedHistory.filter(entry => entry.optimizationMethod !== 'none')
    : sortedHistory

  const handleSort = (field: keyof HistoryEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOptimizationBadge = (entry: HistoryEntry) => {
    switch (entry.optimizationMethod) {
      case 'none':
        return <Badge variant="default" size="sm">無し</Badge>
      case 'random':
        return <Badge variant="warning" size="sm">ランダム</Badge>
      case 'heuristic':
        return <Badge variant="success" size="sm">ヒューリスティック</Badge>
      default:
        return <Badge variant="default" size="sm">不明</Badge>
    }
  }

  const getBestEntry = (): HistoryEntry | null => {
    if (filteredHistory.length === 0) return null
    return filteredHistory.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    )
  }

  const bestEntry = getBestEntry()

  if (history.length === 0) {
    return (
      <div style={{
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: theme.typography.fontSize.xl,
          marginBottom: theme.spacing.md,
          color: theme.colors.textSubtle
        }}>
          📋
        </div>
        <div style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm
        }}>
          シミュレーション履歴
        </div>
        <div style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.textSubtle
        }}>
          シミュレーションを実行すると履歴が表示されます
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
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
          gap: theme.spacing.md
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.semibold
          }}>
            📋 シミュレーション履歴
          </h3>
          <Badge variant="primary" size="sm">
            {filteredHistory.length}件
          </Badge>
          {bestEntry && (
            <Badge variant="success" size="sm">
              最高: {bestEntry.averageScore.toFixed(2)}点
            </Badge>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md
        }}>
          {/* フィルター */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text,
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={filterOptimized}
              onChange={(e) => setFilterOptimized(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            最適化のみ表示
          </label>

          <Button
            variant="danger"
            size="sm"
            onClick={onClearHistory}
            disabled={history.length === 0}
          >
            履歴クリア
          </Button>
        </div>
      </div>

      {/* テーブル */}
      <div style={{
        overflowX: 'auto',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: theme.typography.fontSize.sm
        }}>
          <thead>
            <tr style={{
              backgroundColor: theme.colors.background,
              borderBottom: `1px solid ${theme.colors.border}`
            }}>
              {[
                { key: 'timestamp', label: '実行時刻' },
                { key: 'averageScore', label: '平均得点' },
                { key: 'totalGames', label: '試合数' },
                { key: 'optimizationMethod', label: '最適化' },
                { key: 'improvementPercent', label: '改善率' },
                { key: 'lineup', label: '打順プレビュー' },
                { key: 'actions', label: '操作' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  style={{
                    padding: theme.spacing.md,
                    textAlign: 'left',
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text,
                    cursor: key !== 'actions' ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => key !== 'actions' && handleSort(key as keyof HistoryEntry)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs
                  }}>
                    {label}
                    {sortField === key && (
                      <span style={{
                        fontSize: '12px',
                        color: theme.colors.primary
                      }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((entry) => (
              <tr
                key={entry.id}
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                  backgroundColor: entry === bestEntry ? theme.colors.successLight : 'transparent'
                }}
              >
                <td style={{ padding: theme.spacing.md }}>
                  <div style={{ 
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.sm
                  }}>
                    {formatTimestamp(entry.timestamp)}
                  </div>
                  <div style={{
                    color: theme.colors.textSubtle,
                    fontSize: theme.typography.fontSize.xs
                  }}>
                    {entry.executionTime.toFixed(0)}ms
                  </div>
                </td>

                <td style={{ padding: theme.spacing.md }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: entry === bestEntry ? theme.colors.success : theme.colors.text
                  }}>
                    {entry.averageScore.toFixed(2)}
                  </div>
                  {entry === bestEntry && (
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.success
                    }}>
                      🏆 最高記録
                    </div>
                  )}
                </td>

                <td style={{ padding: theme.spacing.md, color: theme.colors.text }}>
                  {entry.totalGames.toLocaleString()}
                </td>

                <td style={{ padding: theme.spacing.md }}>
                  {getOptimizationBadge(entry)}
                </td>

                <td style={{ padding: theme.spacing.md }}>
                  {entry.improvementPercent !== undefined ? (
                    <div style={{
                      color: entry.improvementPercent > 0 ? theme.colors.success : theme.colors.textSubtle,
                      fontWeight: entry.improvementPercent > 0 ? theme.typography.fontWeight.bold : 'normal'
                    }}>
                      {entry.improvementPercent > 0 ? '+' : ''}{entry.improvementPercent.toFixed(1)}%
                    </div>
                  ) : (
                    <span style={{ color: theme.colors.textSubtle }}>—</span>
                  )}
                </td>

                <td style={{ padding: theme.spacing.md }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSubtle,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {entry.lineup.slice(0, 3).map(p => p.選手名).join(', ')}
                    {entry.lineup.length > 3 && '...'}
                  </div>
                </td>

                <td style={{ padding: theme.spacing.md }}>
                  <div style={{
                    display: 'flex',
                    gap: theme.spacing.xs
                  }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onLoadLineup(entry.lineup)}
                    >
                      読込
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteEntry(entry.id)}
                    >
                      削除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* サマリー */}
      {filteredHistory.length > 1 && (
        <div style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm
          }}>
            📊 履歴サマリー
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: theme.spacing.md,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSubtle
          }}>
            <div>
              <strong>平均得点:</strong>{' '}
              {(filteredHistory.reduce((sum, entry) => sum + entry.averageScore, 0) / filteredHistory.length).toFixed(2)}
            </div>
            <div>
              <strong>最高得点:</strong>{' '}
              {Math.max(...filteredHistory.map(entry => entry.averageScore)).toFixed(2)}
            </div>
            <div>
              <strong>最低得点:</strong>{' '}
              {Math.min(...filteredHistory.map(entry => entry.averageScore)).toFixed(2)}
            </div>
            <div>
              <strong>総試行回数:</strong>{' '}
              {filteredHistory.reduce((sum, entry) => sum + entry.totalGames, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}