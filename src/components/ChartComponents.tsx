import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { theme } from '../styles/atlassian-theme'

// Chart.js の必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface ScoreDistributionChartProps {
  scores: number[]
  title?: string
}

// 得点分布ヒストグラム
export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ 
  scores, 
  title = '得点分布ヒストグラム' 
}) => {
  // ヒストグラムデータを生成
  const generateHistogramData = (scores: number[]) => {
    if (scores.length === 0) return { labels: [], data: [] }
    
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const binCount = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(scores.length))))
    const binWidth = Math.max(1, Math.ceil((max - min) / binCount))
    
    const bins: number[] = new Array(binCount).fill(0)
    const labels: string[] = []
    
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth - 1
      labels.push(`${binStart}-${binEnd}`)
    }
    
    scores.forEach(score => {
      const binIndex = Math.min(binCount - 1, Math.floor((score - min) / binWidth))
      bins[binIndex]++
    })
    
    return { labels, data: bins }
  }

  const { labels, data } = generateHistogramData(scores)

  const chartData = {
    labels,
    datasets: [
      {
        label: '試合数',
        data,
        backgroundColor: `${theme.colors.primary}80`, // 50% opacity
        borderColor: theme.colors.primary,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title,
        color: theme.colors.text,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: (context: unknown[]) => `得点範囲: ${(context[0] as {label: string}).label}`,
          label: (context: {parsed: {y: number}}) => `試合数: ${context.parsed.y}回 (${((context.parsed.y / scores.length) * 100).toFixed(1)}%)`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '得点',
          color: theme.colors.text,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: theme.colors.textSubtle
        },
        grid: {
          color: `${theme.colors.border}40`
        }
      },
      y: {
        title: {
          display: true,
          text: '試合数',
          color: theme.colors.text,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: theme.colors.textSubtle,
          stepSize: 1
        },
        grid: {
          color: `${theme.colors.border}40`
        }
      }
    }
  }

  return (
    <div style={{ 
      height: '300px', 
      width: '100%',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`
    }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

interface StatisticsBoxplotProps {
  data: {
    min: number
    q1: number
    median: number
    q3: number
    max: number
    average: number
  }
  title?: string
}

// 統計サマリー箱ひげ図風表示（Chart.jsのboxplot拡張は複雑なので簡易版）
export const StatisticsSummaryChart: React.FC<StatisticsBoxplotProps> = ({ 
  data,
  title = '統計サマリー'
}) => {
  const chartData = {
    labels: ['得点統計'],
    datasets: [
      {
        label: '最小値',
        data: [data.min],
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
        borderWidth: 2
      },
      {
        label: '第1四分位数',
        data: [data.q1],
        backgroundColor: theme.colors.warning,
        borderColor: theme.colors.warning,
        borderWidth: 2
      },
      {
        label: '中央値',
        data: [data.median],
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        borderWidth: 3
      },
      {
        label: '平均値',
        data: [data.average],
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 8
      },
      {
        label: '第3四分位数',
        data: [data.q3],
        backgroundColor: theme.colors.warning,
        borderColor: theme.colors.warning,
        borderWidth: 2
      },
      {
        label: '最大値',
        data: [data.max],
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: theme.colors.text,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      title: {
        display: true,
        text: title,
        color: theme.colors.text,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (tooltipItem: any) => `${tooltipItem.dataset.label || 'データ'}: ${tooltipItem.parsed.x.toFixed(2)}点`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '得点',
          color: theme.colors.text,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: theme.colors.textSubtle
        },
        grid: {
          color: `${theme.colors.border}40`
        }
      },
      y: {
        ticks: {
          color: theme.colors.textSubtle
        },
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div style={{ 
      height: '200px', 
      width: '100%',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`
    }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

interface PerformanceComparisonProps {
  originalAverage: number
  optimizedAverage?: number
  optimizationHistory?: Array<{ iteration: number; average: number }>
  title?: string
}

// 最適化プロセス可視化
export const PerformanceComparisonChart: React.FC<PerformanceComparisonProps> = ({
  originalAverage,
  optimizedAverage,
  optimizationHistory = [],
  title = '最適化プロセス'
}) => {
  const hasOptimization = optimizedAverage !== undefined && optimizationHistory.length > 0

  if (!hasOptimization) {
    // 最適化なしの場合は基準線のみ表示
    const chartData = {
      labels: ['元の打順'],
      datasets: [
        {
          label: '平均得点',
          data: [originalAverage],
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
          borderWidth: 2
        }
      ]
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: '平均得点（最適化なし）',
          color: theme.colors.text,
          font: {
            size: 16,
            weight: 'bold' as const
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '平均得点',
            color: theme.colors.text
          },
          ticks: {
            color: theme.colors.textSubtle
          }
        },
        x: {
          ticks: {
            color: theme.colors.textSubtle
          }
        }
      }
    }

    return (
      <div style={{ 
        height: '250px', 
        width: '100%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`
      }}>
        <Bar data={chartData} options={options} />
      </div>
    )
  }

  // 最適化プロセスの可視化
  const chartData = {
    labels: optimizationHistory.map((_, index) => `${index + 1}回目`),
    datasets: [
      {
        label: '最適化進捗',
        data: optimizationHistory.map(h => h.average),
        borderColor: theme.colors.success,
        backgroundColor: `${theme.colors.success}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.2
      },
      {
        label: '元の平均',
        data: new Array(optimizationHistory.length).fill(originalAverage),
        borderColor: theme.colors.textSubtle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme.colors.text
        }
      },
      title: {
        display: true,
        text: title,
        color: theme.colors.text,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.border,
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '最適化反復',
          color: theme.colors.text
        },
        ticks: {
          color: theme.colors.textSubtle
        },
        grid: {
          color: `${theme.colors.border}40`
        }
      },
      y: {
        title: {
          display: true,
          text: '平均得点',
          color: theme.colors.text
        },
        ticks: {
          color: theme.colors.textSubtle
        },
        grid: {
          color: `${theme.colors.border}40`
        }
      }
    }
  }

  return (
    <div style={{ 
      height: '300px', 
      width: '100%',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`
    }}>
      <Line data={chartData} options={options} />
    </div>
  )
}