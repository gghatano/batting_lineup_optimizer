import React from 'react'
import { theme } from '../styles/atlassian-theme'

export interface ProgressBarProps {
  progress: number // 0-1の値
  total?: number
  completed?: number
  currentAverage?: number
  estimatedTimeRemaining?: number
  showDetails?: boolean
  label?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  completed,
  currentAverage,
  estimatedTimeRemaining,
  showDetails = true,
  label
}) => {
  // プログレス値の検証と安定化
  const validProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0
  const clampedProgress = Math.min(1, Math.max(0, validProgress))
  
  // より安定した percentage 計算（浮動小数点エラーを回避）
  const percentage = Math.round(clampedProgress * 100 * 10) / 10
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}分${remainingSeconds > 0 ? remainingSeconds + '秒' : ''}`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}時間${minutes > 0 ? minutes + '分' : ''}`
    }
  }

  return (
    <div style={{
      width: '100%',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm
    }}>
      {/* ラベル */}
      {label && (
        <div style={{
          marginBottom: theme.spacing.sm,
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text,
          textAlign: 'center'
        }}>
          {label}
        </div>
      )}
      
      {/* プログレスバー本体 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '20px',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden'
      }}>
        {/* 進捗バー */}
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: percentage < 100 ? theme.colors.primary : theme.colors.success,
          borderRadius: theme.borderRadius.sm,
          // 急激な更新時の不安定さを回避するため、短いトランジションまたは条件付きトランジション
          transition: percentage >= 99 ? 'background-color 0.2s ease-in-out' : 'none',
          position: 'relative'
        }}>
          {/* 光沢効果 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            borderRadius: `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`
          }} />
        </div>
        
        {/* パーセンテージテキスト */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: percentage > 50 ? theme.colors.secondary : theme.colors.text,
          textShadow: percentage > 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
          whiteSpace: 'nowrap',
          zIndex: 1
        }}>
          {percentage.toFixed(1)}%
        </div>
      </div>
      
      {/* 詳細情報 */}
      {showDetails && (
        <div style={{
          marginTop: theme.spacing.sm,
          display: 'grid',
          gridTemplateColumns: completed && total ? '1fr 1fr' : '1fr',
          gap: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textSubtle
        }}>
          {/* 左側の情報 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            {completed !== undefined && total !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>進捗:</span>
                <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text }}>
                  {formatNumber(completed)} / {formatNumber(total)}試合
                </span>
              </div>
            )}
            
            {currentAverage !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>現在の平均:</span>
                <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.primary }}>
                  {currentAverage.toFixed(2)}点
                </span>
              </div>
            )}
          </div>
          
          {/* 右側の情報 */}
          {(completed && total && completed < total) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>残り時間:</span>
                  <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.warning }}>
                    約{formatTime(estimatedTimeRemaining)}
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>残り:</span>
                <span style={{ fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textSubtle }}>
                  {formatNumber(total - completed)}試合
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 完了状態 */}
      {percentage >= 100 && (
        <div style={{
          marginTop: theme.spacing.sm,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.successLight,
          color: theme.colors.success,
          borderRadius: theme.borderRadius.sm,
          border: `1px solid ${theme.colors.success}`,
          textAlign: 'center',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium
        }}>
          ✅ シミュレーション完了！
        </div>
      )}
    </div>
  )
}