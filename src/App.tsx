import './App.css'
import { useState } from 'react'
import { usePlayers } from './hooks/usePlayers'
import { Player } from './types/Player'
import { PlayerTable } from './components/PlayerTable'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Badge } from './components/Badge'
import { LoadingState } from './components/LoadingSpinner'
import { SimulationParameters } from './components/SimulationParameters'
import { SimulationResults, SimulationResult } from './components/SimulationResults'
import { LineupDisplay } from './components/LineupDisplay'
import { HistoryGrid } from './components/HistoryGrid'
import { SimulationDebugger } from './components/SimulationDebugger'
import { runSimulation, SimulationParams } from './utils/simulation'
import { useHistoryStore, createHistoryEntry } from './stores/historyStore'
import { theme } from './styles/atlassian-theme'

type AppMode = 'selection' | 'simulation' | 'history'

function App() {
  const [customUrl, setCustomUrl] = useState<string>('')
  const [isUsingCustomUrl, setIsUsingCustomUrl] = useState<boolean>(false)
  const [appMode, setAppMode] = useState<AppMode>('selection')
  const { data: players, isLoading, error } = usePlayers(isUsingCustomUrl ? customUrl : undefined)
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false)
  
  // プログレス管理
  const [simulationProgress, setSimulationProgress] = useState({
    progress: 0,
    completedGames: 0,
    totalGames: 0,
    currentAverage: 0,
    startTime: 0,
    estimatedTimeRemaining: 0
  })
  
  // 現在のメインシミュレーションIDを追跡（最適化の副次的なシミュレーションを除外）
  const [mainSimulationId, setMainSimulationId] = useState<string | null>(null)
  
  // 履歴管理
  const { history, addEntry, deleteEntry, clearHistory } = useHistoryStore()

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

  // プログレス更新のコールバック関数
  const handleProgressUpdate = (progress: { completedGames: number; totalGames: number; progress: number; currentAverage: number; simulationId?: string }) => {
    console.log(`📊 プログレス受信: ${progress.completedGames}/${progress.totalGames}, ID: ${progress.simulationId || 'なし'}, メインID: ${mainSimulationId}`)
    
    // メインシミュレーションIDが設定されている場合、そのIDと一致しない場合は無視
    if (mainSimulationId && progress.simulationId && progress.simulationId !== mainSimulationId) {
      console.log(`⏭️ 最適化用シミュレーション (ID: ${progress.simulationId}) - プログレス更新をスキップ`)
      return
    }
    
    // メインシミュレーションIDが設定されているが、プログレス更新にIDが含まれていない場合も無視（古いAPI）
    if (mainSimulationId && !progress.simulationId) {
      console.log(`⏭️ ID未設定のプログレス更新 - プログレス更新をスキップ`)
      return
    }
    
    // 最適化中の小規模シミュレーション（1000試合以下）も無視（フォールバック保護）
    if (progress.totalGames < simulationProgress.totalGames * 0.5) {
      console.log(`⏭️ 最適化用の小規模シミュレーション (${progress.totalGames}試合) - プログレス更新をスキップ`)
      return
    }
    
    // デバッグ用: プログレス更新をログ出力
    console.log(`🔄 プログレス更新: ${progress.completedGames}/${progress.totalGames} (${(progress.progress * 100).toFixed(1)}%)`)
    
    // より安定した時間計算（ゼロ除算エラーと異常値を回避）
    const elapsed = performance.now() - simulationProgress.startTime
    let estimatedTimeRemaining = 0
    
    if (progress.progress > 0.01 && elapsed > 1000) { // 最低1%かつ1秒経過後に予測開始
      const estimatedTotal = elapsed / progress.progress
      estimatedTimeRemaining = Math.max(0, Math.min((estimatedTotal - elapsed) / 1000, 3600)) // 最大1時間でキャップ
    }
    
    setSimulationProgress({
      progress: Math.min(1, Math.max(0, progress.progress)), // 0-1の範囲でクランプ
      completedGames: progress.completedGames,
      totalGames: progress.totalGames,
      currentAverage: progress.currentAverage,
      startTime: simulationProgress.startTime,
      estimatedTimeRemaining
    })
  }

  const handleStartSimulation = async (params: SimulationParams) => {
    if (selectedPlayers.length !== 9) {
      alert('9人の選手を選択してください')
      return
    }

    setIsSimulationRunning(true)
    setSimulationResult(null)
    setAppMode('simulation')
    
    // メインシミュレーションIDを生成
    const simulationId = `main_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setMainSimulationId(simulationId)
    console.log(`🎯 メインシミュレーションID生成: ${simulationId}`)
    
    // プログレス初期化
    setSimulationProgress({
      progress: 0,
      completedGames: 0,
      totalGames: params.numberOfGames,
      currentAverage: 0,
      startTime: performance.now(),
      estimatedTimeRemaining: 0
    })
    
    try {
      // プログレスコールバックにシミュレーションIDを含める
      const progressCallback = (progress: { completedGames: number; totalGames: number; progress: number; currentAverage: number; simulationId?: string }) => {
        handleProgressUpdate({ ...progress, simulationId })
      }
      
      const result = await runSimulation(selectedPlayers, params, progressCallback)
      setSimulationResult(result)
      
      // 完了時のプログレス状態を1.0に設定（完了状態を示す）
      setSimulationProgress({
        progress: 1.0,
        completedGames: result.totalGames,
        totalGames: result.totalGames,
        currentAverage: result.averageScore,
        startTime: 0,
        estimatedTimeRemaining: 0
      })
      
      // 履歴に追加
      const historyEntry = createHistoryEntry(
        selectedPlayers,
        result.averageScore,
        result.totalGames,
        result.executionTime || 0,
        params.optimizationMethod,
        result.improvementPercent
      )
      addEntry(historyEntry)
    } catch (error) {
      console.error('Simulation failed:', error)
      // エラーハンドリング（実際の実装では適切なエラー表示）
    } finally {
      setIsSimulationRunning(false)
      setMainSimulationId(null) // シミュレーション完了時にIDをリセット
    }
  }

  const handleBackToSelection = () => {
    setAppMode('selection')
    setSimulationResult(null)
    setIsSimulationRunning(false)
    // プログレス状態もリセット
    setSimulationProgress({
      progress: 0,
      completedGames: 0,
      totalGames: 0,
      currentAverage: 0,
      startTime: 0,
      estimatedTimeRemaining: 0
    })
  }

  // 履歴からの打順読み込み
  const handleLoadLineupFromHistory = (lineup: Player[]) => {
    setSelectedPlayers(lineup)
    setAppMode('selection')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize.xl, 
              color: theme.colors.text,
              fontWeight: theme.typography.fontWeight.semibold
            }}>野球打順最適化アプリ</h1>
            
            {/* ナビゲーション */}
            <nav style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button
                variant={appMode === 'selection' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAppMode('selection')}
              >
                選手選択
              </Button>
              <Button
                variant={appMode === 'simulation' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAppMode('simulation')}
                disabled={!simulationResult}
              >
                シミュレーション
              </Button>
              <Button
                variant={appMode === 'history' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAppMode('history')}
              >
                履歴 ({history.length})
              </Button>
            </nav>
          </div>
          
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
        {appMode === 'selection' ? (
          <>
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
                margin: `0 0 ${theme.spacing.lg} 0`, 
                textAlign: 'center', 
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold
              }}>打順</h3>
              
              {selectedPlayers.length === 9 && (
                <div style={{ 
                  marginBottom: theme.spacing.lg,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.sm
                }}>
                  <div style={{ 
                    padding: theme.spacing.md, 
                    backgroundColor: theme.colors.success, 
                    color: theme.colors.secondary,
                    borderRadius: theme.borderRadius.md,
                    textAlign: 'center',
                    fontWeight: theme.typography.fontWeight.semibold,
                    boxShadow: theme.shadows.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}>
                    ✓ 打順完成！
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAppMode('simulation')}
                      style={{ flex: 1 }}
                    >
                      実験開始
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayers([])
                        setAppMode('selection')
                      }}
                      style={{ flex: 1 }}
                    >
                      選手変更
                    </Button>
                  </div>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px'
              }}>
                {Array.from({ length: 9 }, (_, index) => {
                  const player = selectedPlayers[index]
                  return (
                    <div
                      key={`batting-order-${index}`}
                      style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: player ? theme.colors.primary : theme.colors.surface,
                        color: player ? theme.colors.secondary : theme.colors.textMuted,
                        border: `1px solid ${player ? theme.colors.primary : theme.colors.border}`,
                        borderRadius: theme.borderRadius.sm,
                        minHeight: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: player ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
                        boxShadow: player ? theme.shadows.sm : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          minWidth: '18px', 
                          fontWeight: theme.typography.fontWeight.bold, 
                          marginRight: theme.spacing.xs,
                          fontSize: theme.typography.fontSize.sm
                        }}>
                          {index + 1}.
                        </span>
                        {player ? (
                          <div>
                            <div style={{ marginBottom: '0px', lineHeight: '1.1' }}>
                              {player.選手名} (#{player.背番号})
                            </div>
                            <div style={{ 
                              fontSize: theme.typography.fontSize.xs, 
                              opacity: 0.8, 
                              display: 'flex', 
                              gap: theme.spacing.xs,
                              lineHeight: '1.0'
                            }}>
                              <span>{player.チーム}</span>
                              <span>打率{calculateBattingAverage(player)}</span>
                              <span>{player.本塁打}HR</span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontStyle: 'italic', fontSize: theme.typography.fontSize.sm }}>
                            選手を選択してください
                          </span>
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
                            width: '20px',
                            height: '20px',
                            minHeight: '20px',
                            padding: '0',
                            fontSize: theme.typography.fontSize.xs
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
          </>
        ) : appMode === 'simulation' ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: theme.spacing.lg, 
            height: '100%',
            minHeight: 0 
          }}>
            
            {/* メインコンテンツ: 3列レイアウト */}
            <div style={{ 
              display: 'flex', 
              gap: theme.spacing.xl, 
              flex: 1,
              minHeight: 0
            }}>
              {/* 左側: 打順表示 */}
              <LineupDisplay
                players={selectedPlayers}
                onBackToSelection={handleBackToSelection}
              />
              
              {/* 中央: 実験設定パラメータ */}
              <SimulationParameters
                onStartSimulation={handleStartSimulation}
                isRunning={isSimulationRunning}
                selectedPlayers={selectedPlayers}
              />
              
              {/* 右側: シミュレーション結果 */}
              <div style={{ 
                flex: 1, 
                minHeight: 0, 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <SimulationResults
                  result={simulationResult}
                  isRunning={isSimulationRunning}
                  progress={simulationProgress}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 履歴画面 */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden' 
            }}>
              <HistoryGrid
                history={history}
                onLoadLineup={handleLoadLineupFromHistory}
                onClearHistory={clearHistory}
                onDeleteEntry={deleteEntry}
              />
            </div>
          </>
        )}
      </main>
      
      {/* デバッガー（開発時のみ表示） */}
      <SimulationDebugger />
    </div>
  )
}

export default App