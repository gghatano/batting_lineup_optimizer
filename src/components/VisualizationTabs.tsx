import React, { useState } from 'react'
import { theme } from '../styles/atlassian-theme'
import { ScoreDistributionChart, StatisticsSummaryChart, PerformanceComparisonChart } from './ChartComponents'
import { calculatePercentile } from '../utils/statistics'

interface VisualizationTabsProps {
  scores: number[]
  minScore: number
  maxScore: number
  averageScore: number
  improvementPercent?: number
}

type TabId = 'histogram' | 'statistics' | 'comparison'

interface Tab {
  id: TabId
  label: string
  icon: string
  description: string
}

const tabs: Tab[] = [
  {
    id: 'histogram',
    label: '得点分布',
    icon: '📊',
    description: '試合ごとの得点分布をヒストグラムで表示'
  },
  {
    id: 'statistics',
    label: '統計サマリー',
    icon: '📈',
    description: '四分位数・平均値・最大最小値の統計情報'
  },
  {
    id: 'comparison',
    label: 'パフォーマンス',
    icon: '⚡',
    description: '最適化前後の比較・改善プロセス'
  }
]

export const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  scores,
  minScore,
  maxScore,
  averageScore,
  improvementPercent
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('histogram')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'histogram':
        return (
          <ScoreDistributionChart 
            scores={scores} 
            title="得点分布ヒストグラム"
          />
        )
      
      case 'statistics':
        return (
          <StatisticsSummaryChart
            data={{
              min: minScore,
              q1: calculatePercentile(scores, 25),
              median: calculatePercentile(scores, 50),
              q3: calculatePercentile(scores, 75),
              max: maxScore,
              average: averageScore
            }}
            title="統計サマリー（四分位数・平均値）"
          />
        )
      
      case 'comparison':
        return (
          <PerformanceComparisonChart
            originalAverage={averageScore}
            optimizedAverage={improvementPercent !== undefined ? averageScore * (1 + improvementPercent / 100) : undefined}
            title="パフォーマンス比較"
          />
        )
      
      default:
        return null
    }
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div style={{
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ヘッダー */}
      <div style={{
        marginBottom: theme.spacing.lg
      }}>
        <div style={{
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          📊 データ可視化
          {activeTabData && (
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSubtle,
              fontWeight: theme.typography.fontWeight.normal
            }}>
              - {activeTabData.description}
            </span>
          )}
        </div>
        
        {/* タブナビゲーション */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          gap: '2px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: activeTab === tab.id ? theme.colors.primary : theme.colors.surface,
                color: activeTab === tab.id ? theme.colors.secondary : theme.colors.text,
                border: 'none',
                borderRadius: `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: activeTab === tab.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                outline: 'none',
                boxShadow: activeTab === tab.id ? theme.shadows.sm : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.background
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.surface
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          minHeight: 0 // フレックスアイテムのスクロール対応
        }}>
          {renderTabContent()}
        </div>
      </div>

      {/* タブ切り替えヒント */}
      <div style={{
        marginTop: theme.spacing.md,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSubtle,
        textAlign: 'center'
      }}>
        💡 ヒント: タブをクリックして他の可視化グラフも確認できます
      </div>
    </div>
  )
}