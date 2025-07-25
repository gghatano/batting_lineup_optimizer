import './App.css'
import { useState } from 'react'
import { usePlayers } from './hooks/usePlayers'
import { Player } from './types/Player'
import { PlayerTable } from './components/PlayerTable'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Badge } from './components/Badge'
import { LoadingState } from './components/LoadingSpinner'
import { theme } from './styles/atlassian-theme'

function App() {
  const [customUrl, setCustomUrl] = useState<string>('')
  const [isUsingCustomUrl, setIsUsingCustomUrl] = useState<boolean>(false)
  const { data: players, isLoading, error } = usePlayers(isUsingCustomUrl ? customUrl : undefined)
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])

  const handlePlayerAdd = (player: Player) => {
    if (selectedPlayers.length < 9) {
      setSelectedPlayers(prev => [...prev, player])
    }
  }

  const handlePlayerRemove = (index: number) => {
    setSelectedPlayers(prev => prev.filter((_, i) => i !== index))
  }

  const calculateBattingAverage = (player: Player) => {
    return player.打率.toFixed(3)
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: theme.colors.background 
      }}>
        <header style={{
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.xxl, 
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.semibold
          }}>野球打順最適化アプリ</h1>
        </header>
        <LoadingState message="選手データを読み込み中..." size="lg">
          <div />
        </LoadingState>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: theme.colors.background 
      }}>
        <header style={{
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.xxl, 
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.semibold
          }}>野球打順最適化アプリ</h1>
        </header>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: theme.spacing.xl,
          textAlign: 'center'
        }}>
          <div style={{
            padding: theme.spacing.xl,
            backgroundColor: theme.colors.dangerLight,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.danger}`,
            maxWidth: '600px'
          }}>
            <h2 style={{ 
              color: theme.colors.danger, 
              fontSize: theme.typography.fontSize.lg,
              margin: `0 0 ${theme.spacing.md} 0`
            }}>エラーが発生しました</h2>
            <p style={{ 
              color: theme.colors.danger,
              fontSize: theme.typography.fontSize.base,
              margin: 0
            }}>
              {error instanceof Error ? error.message : '不明なエラーが発生しました'}
            </p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.colors.background
    }}>
      <header style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        gap: theme.spacing.lg,
        boxShadow: theme.shadows.sm
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: theme.typography.fontSize.xl, 
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.semibold
          }}>野球打順最適化アプリ</h1>
          <div style={{ 
            fontSize: theme.typography.fontSize.base, 
            color: theme.colors.textSubtle, 
            display: 'flex', 
            gap: theme.spacing.lg, 
            alignItems: 'center' 
          }}>
            <span>選手データ: {(players || []).length}名</span>
            <Badge 
              variant={isUsingCustomUrl ? 'warning' : (import.meta.env.VITE_DATA_MODE === 'remote' ? 'primary' : 'default')}
              size="sm"
            >
              {isUsingCustomUrl ? 'カスタム' : (import.meta.env.VITE_DATA_MODE === 'remote' ? 'リモート' : 'ローカル')}
            </Badge>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ 
            fontSize: theme.typography.fontSize.base, 
            fontWeight: theme.typography.fontWeight.medium, 
            color: theme.colors.text, 
            minWidth: '120px' 
          }}>
            Google Sheets URL:
          </label>
          <Input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
            style={{
              flex: 1,
              minWidth: '300px'
            }}
          />
          <Button
            variant="primary"
            onClick={() => {
              if (customUrl.trim()) {
                // URL形式の簡易バリデーション
                if (!customUrl.includes('docs.google.com/spreadsheets')) {
                  alert('Google SheetsのURLを入力してください')
                  return
                }
                setIsUsingCustomUrl(true)
                setSelectedPlayers([])
              } else {
                setIsUsingCustomUrl(false)
                setSelectedPlayers([])
              }
            }}
            style={{
              minWidth: '80px'
            }}
          >
            {customUrl.trim() ? '読み込み' : 'リセット'}
          </Button>
          {isUsingCustomUrl && (
            <Button
              variant="danger"
              onClick={() => {
                setIsUsingCustomUrl(false)
                setCustomUrl('')
                setSelectedPlayers([])
              }}
            >
              デフォルトに戻す
            </Button>
          )}
        </div>
      </header>
      
      <main style={{ 
        display: 'flex', 
        gap: theme.spacing.xl, 
        flex: 1, 
        padding: theme.spacing.xl, 
        overflow: 'hidden' 
      }}>
        {/* 左側: 選手選択テーブル */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border}`,
          padding: theme.spacing.xl,
          boxShadow: theme.shadows.md
        }}>
          <h2 style={{ 
            margin: `0 0 ${theme.spacing.lg} 0`, 
            fontSize: theme.typography.fontSize.lg, 
            color: theme.colors.text,
            fontWeight: theme.typography.fontWeight.semibold
          }}>選手選択</h2>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <PlayerTable
              players={players || []}
              selectedPlayers={selectedPlayers}
              onPlayerAdd={handlePlayerAdd}
            />
          </div>
        </div>

        {/* 右側: 打順表示 */}
        <div style={{ 
          width: '320px', 
          padding: theme.spacing.xl, 
          backgroundColor: theme.colors.background, 
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.md
        }}>
          <h3 style={{ 
            margin: `0 0 ${theme.spacing.xl} 0`, 
            textAlign: 'center', 
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold
          }}>打順</h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing.sm 
          }}>
            {Array.from({ length: 9 }, (_, index) => {
              const player = selectedPlayers[index]
              return (
                <div
                  key={`batting-order-${index}`}
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: player ? theme.colors.primary : theme.colors.surface,
                    color: player ? theme.colors.secondary : theme.colors.textMuted,
                    border: `2px solid ${player ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: player ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                    boxShadow: player ? theme.shadows.sm : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      minWidth: '20px', 
                      fontWeight: theme.typography.fontWeight.bold, 
                      marginRight: theme.spacing.sm 
                    }}>
                      {index + 1}.
                    </span>
                    {player ? (
                      <div>
                        <div style={{ marginBottom: '2px' }}>{player.選手名} (#{player.背番号})</div>
                        <div style={{ 
                          fontSize: theme.typography.fontSize.xs, 
                          opacity: 0.8, 
                          marginBottom: '2px' 
                        }}>{player.チーム}</div>
                        <div style={{ 
                          fontSize: theme.typography.fontSize.xs, 
                          opacity: 0.9, 
                          display: 'flex', 
                          gap: theme.spacing.sm 
                        }}>
                          <span>打率: {calculateBattingAverage(player)}</span>
                          <span>本塁打: {player.本塁打}</span>
                          <span>打点: {player.打点}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontStyle: 'italic' }}>選手を選択してください</span>
                    )}
                  </div>
                  {player && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handlePlayerRemove(index)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        minHeight: '24px',
                        padding: '0',
                        fontSize: theme.typography.fontSize.sm
                      }}
                      title="削除"
                    >
                      ×
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          
          {selectedPlayers.length === 9 && (
            <div style={{ 
              marginTop: theme.spacing.xl, 
              padding: theme.spacing.lg, 
              backgroundColor: theme.colors.success, 
              color: theme.colors.secondary,
              borderRadius: theme.borderRadius.md,
              textAlign: 'center',
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: theme.shadows.sm
            }}>
              ✓ 打順完成！
            </div>
          )}
          
          {selectedPlayers.length > 0 && selectedPlayers.length < 9 && (
            <div style={{ 
              marginTop: theme.spacing.xl, 
              padding: theme.spacing.md, 
              backgroundColor: theme.colors.warningLight, 
              border: `1px solid ${theme.colors.warning}`,
              borderRadius: theme.borderRadius.md,
              textAlign: 'center',
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.warning
            }}>
              あと{9 - selectedPlayers.length}名選択してください
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App