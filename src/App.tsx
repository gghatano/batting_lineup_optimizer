import './App.css'
import { useState } from 'react'
import { usePlayers } from './hooks/usePlayers'
import { Player } from './types/Player'
import { PlayerTable } from './components/PlayerTable'

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
      <div className="App">
        <header className="App-header">
          <h1>野球打順最適化アプリ</h1>
          <p>選手データを読み込み中...</p>
        </header>
      </div>
    )
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>野球打順最適化アプリ</h1>
          <p style={{ color: 'red' }}>
            エラー: {error instanceof Error ? error.message : '不明なエラー'}
          </p>
        </header>
      </div>
    )
  }


  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        display: 'flex', 
        flexDirection: 'column',
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        gap: '15px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>野球打順最適化アプリ</h1>
          <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span>選手データ: {(players || []).length}名</span>
            <span style={{ 
              padding: '2px 6px', 
              backgroundColor: isUsingCustomUrl ? '#fff3cd' : (import.meta.env.VITE_DATA_MODE === 'remote' ? '#e3f2fd' : '#f0f0f0'),
              borderRadius: '3px',
              fontSize: '12px',
              color: isUsingCustomUrl ? '#856404' : '#333'
            }}>
              {isUsingCustomUrl ? 'カスタム' : (import.meta.env.VITE_DATA_MODE === 'remote' ? 'リモート' : 'ローカル')}
            </span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', minWidth: '120px' }}>
            Google Sheets URL:
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none'
            }}
          />
          <button
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
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            {customUrl.trim() ? '読み込み' : 'リセット'}
          </button>
          {isUsingCustomUrl && (
            <button
              onClick={() => {
                setIsUsingCustomUrl(false)
                setCustomUrl('')
                setSelectedPlayers([])
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              デフォルトに戻す
            </button>
          )}
        </div>
      </header>
      
      <main style={{ display: 'flex', gap: '20px', flex: 1, padding: '20px', overflow: 'hidden' }}>
        {/* 左側: 選手選択テーブル */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          padding: '20px'
        }}>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '18px', 
            color: '#333',
            fontWeight: 'bold'
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
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#333' }}>打順</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 9 }, (_, index) => {
              const player = selectedPlayers[index]
              return (
                <div
                  key={`batting-order-${index}`}
                  style={{
                    padding: '12px',
                    backgroundColor: player ? '#2196f3' : 'white',
                    color: player ? 'white' : '#666',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: player ? 'bold' : 'normal'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      minWidth: '20px', 
                      fontWeight: 'bold', 
                      marginRight: '10px' 
                    }}>
                      {index + 1}.
                    </span>
                    {player ? (
                      <div>
                        <div style={{ marginBottom: '2px' }}>{player.選手名} (#{player.背番号})</div>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>{player.チーム}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, display: 'flex', gap: '8px' }}>
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
                    <button
                      onClick={() => handlePlayerRemove(index)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="削除"
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          
          {selectedPlayers.length === 9 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#4caf50', 
              color: 'white',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              ✓ 打順完成！
            </div>
          )}
          
          {selectedPlayers.length > 0 && selectedPlayers.length < 9 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#856404'
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