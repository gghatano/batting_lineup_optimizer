import React, { useState, useEffect } from 'react'
import { theme } from '../styles/atlassian-theme'
import { Badge } from './Badge'
import { Button } from './Button'

interface DebugLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export const SimulationDebugger: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    // コンソールログをキャプチャ
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    const addLog = (level: 'info' | 'warn' | 'error', message: string) => {
      const timestamp = new Date().toLocaleTimeString()
      setLogs(prev => [...prev.slice(-50), { timestamp, level, message }]) // 最新50件保持
    }

    console.log = (...args) => {
      const message = args.join(' ')
      if (message.includes('🎯') || message.includes('🚀') || message.includes('✅') || 
          message.includes('⚠️') || message.includes('📊') || message.includes('🔄')) {
        addLog('info', message)
      }
      originalLog.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(' ')
      if (message.includes('Web Worker') || message.includes('シミュレーション') || message.includes('フォールバック')) {
        addLog('warn', message)
      }
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('シミュレーション') || message.includes('Worker')) {
        addLog('error', message)
      }
      originalError.apply(console, args)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
  }

  const getLevelColor = (level: 'info' | 'warn' | 'error') => {
    switch (level) {
      case 'info': return theme.colors.primary
      case 'warn': return theme.colors.warning
      case 'error': return theme.colors.danger
      default: return theme.colors.text
    }
  }

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 1000
      }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsVisible(true)}
          style={{
            backgroundColor: theme.colors.warning,
            color: theme.colors.secondary,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
        >
          🔍
        </Button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      width: '400px',
      maxHeight: '300px',
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.lg,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primary,
        color: theme.colors.secondary,
        borderRadius: `${theme.borderRadius.md} ${theme.borderRadius.md} 0 0`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <span>🔍 シミュレーション デバッガー</span>
          <Badge variant="secondary" size="sm">
            {logs.length}
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearLogs}
            style={{
              fontSize: '12px',
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`
            }}
          >
            クリア
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsVisible(false)}
            style={{
              fontSize: '12px',
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`
            }}
          >
            ✕
          </Button>
        </div>
      </div>

      {/* ログ表示 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.sm
      }}>
        {logs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.colors.textSubtle,
            fontSize: theme.typography.fontSize.sm,
            padding: theme.spacing.lg
          }}>
            シミュレーションログはここに表示されます
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                marginBottom: theme.spacing.xs,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.sm,
                border: `1px solid ${getLevelColor(log.level)}20`,
                fontSize: theme.typography.fontSize.xs
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                marginBottom: theme.spacing.xs
              }}>
                <span style={{
                  fontSize: '10px',
                  color: theme.colors.textSubtle
                }}>
                  {log.timestamp}
                </span>
                <Badge
                  variant={log.level === 'info' ? 'primary' : log.level === 'warn' ? 'secondary' : 'danger'}
                  size="sm"
                  style={{
                    fontSize: '10px',
                    padding: `2px ${theme.spacing.xs}`
                  }}
                >
                  {log.level.toUpperCase()}
                </Badge>
              </div>
              <div style={{
                color: getLevelColor(log.level),
                fontSize: theme.typography.fontSize.xs,
                lineHeight: '1.3',
                wordBreak: 'break-all'
              }}>
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* フッター */}
      <div style={{
        padding: theme.spacing.sm,
        borderTop: `1px solid ${theme.colors.border}`,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSubtle,
        backgroundColor: theme.colors.background,
        borderRadius: `0 0 ${theme.borderRadius.md} ${theme.borderRadius.md}`
      }}>
        💡 シミュレーションの実行状況をリアルタイムで監視
      </div>
    </div>
  )
}