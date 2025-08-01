import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '../types/Player'
import { HistoryEntry } from '../components/HistoryGrid'

interface HistoryState {
  history: HistoryEntry[]
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
  deleteEntry: (id: string) => void
  clearHistory: () => void
  getTopEntries: (count: number) => HistoryEntry[]
  getBestEntry: () => HistoryEntry | null
  getOptimizedEntries: () => HistoryEntry[]
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      
      addEntry: (entry) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        }
        
        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 100) // 最大100件保持
        }))
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          history: state.history.filter(entry => entry.id !== id)
        }))
      },
      
      clearHistory: () => {
        set({ history: [] })
      },
      
      getTopEntries: (count) => {
        const { history } = get()
        return [...history]
          .sort((a, b) => b.averageScore - a.averageScore)
          .slice(0, count)
      },
      
      getBestEntry: () => {
        const { history } = get()
        if (history.length === 0) return null
        return history.reduce((best, current) => 
          current.averageScore > best.averageScore ? current : best
        )
      },
      
      getOptimizedEntries: () => {
        const { history } = get()
        return history.filter(entry => entry.optimizationMethod !== 'none')
      }
    }),
    {
      name: 'batting-lineup-history', // localStorage キー名
      version: 1,
      // 履歴データのマイグレーション（必要に応じて）
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // 古いバージョンからの移行処理
          return {
            history: (persistedState as any)?.history || []
          }
        }
        return persistedState as HistoryState
      }
    }
  )
)

// 履歴エントリ作成のヘルパー関数
export const createHistoryEntry = (
  lineup: Player[],
  averageScore: number,
  totalGames: number,
  executionTime: number,
  optimizationMethod: 'none' | 'random' | 'heuristic',
  improvementPercent?: number
): Omit<HistoryEntry, 'id' | 'timestamp'> => {
  return {
    lineup: [...lineup], // 配列の深いコピー
    averageScore,
    totalGames,
    executionTime,
    optimizationMethod,
    improvementPercent
  }
}

// 履歴統計情報の計算
export const calculateHistoryStats = (history: HistoryEntry[]) => {
  if (history.length === 0) {
    return {
      totalSimulations: 0,
      totalGames: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      optimizationSuccessRate: 0,
      averageImprovementPercent: 0
    }
  }

  const totalSimulations = history.length
  const totalGames = history.reduce((sum, entry) => sum + entry.totalGames, 0)
  const averageScore = history.reduce((sum, entry) => sum + entry.averageScore, 0) / history.length
  const bestScore = Math.max(...history.map(entry => entry.averageScore))
  const worstScore = Math.min(...history.map(entry => entry.averageScore))
  
  const optimizedEntries = history.filter(entry => 
    entry.optimizationMethod !== 'none' && entry.improvementPercent !== undefined
  )
  const successfulOptimizations = optimizedEntries.filter(entry => 
    entry.improvementPercent && entry.improvementPercent > 0
  )
  
  const optimizationSuccessRate = optimizedEntries.length > 0 
    ? (successfulOptimizations.length / optimizedEntries.length) * 100 
    : 0
    
  const averageImprovementPercent = successfulOptimizations.length > 0
    ? successfulOptimizations.reduce((sum, entry) => sum + (entry.improvementPercent || 0), 0) / successfulOptimizations.length
    : 0

  return {
    totalSimulations,
    totalGames,
    averageScore,
    bestScore,
    worstScore,
    optimizationSuccessRate,
    averageImprovementPercent
  }
}

// 履歴のエクスポート機能
export const exportHistory = (history: HistoryEntry[]): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: history.map(entry => ({
      ...entry,
      lineup: entry.lineup.map(player => ({
        選手名: player.選手名,
        チーム: player.チーム,
        打率: player.打率,
        本塁打: player.本塁打,
        打点: player.打点
      }))
    }))
  }
  
  return JSON.stringify(exportData, null, 2)
}

// 履歴のインポート機能
export const importHistory = (jsonData: string): HistoryEntry[] => {
  try {
    const importData = JSON.parse(jsonData)
    
    if (!importData.data || !Array.isArray(importData.data)) {
      throw new Error('無効なデータ形式です')
    }
    
    return importData.data.map((entry: {timestamp: string}) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))
  } catch (error) {
    throw new Error('履歴データの読み込みに失敗しました: ' + (error as Error).message)
  }
}