import './App.css'
import { useState } from 'react'
import { usePlayers } from './hooks/usePlayers'
import { Player } from './types/Player'
import { PlayerTable } from './components/PlayerTable'

function App() {
  const { data: players, isLoading, error } = usePlayers()
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
    const hits = player['1B'] + player['2B'] + player['3B'] + player.HR
    const atBats = player.PA - player.BB
    return atBats > 0 ? (hits / atBats).toFixed(3) : '0.000'
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
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        minHeight: '50px'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>野球打順最適化アプリ</h1>
        <span style={{ fontSize: '14px', color: '#666' }}>
          選手データ: {players?.length || 0}名
        </span>
      </header>
      
      <main style={{ display: 'flex', gap: '20px', flex: 1, padding: '20px', overflow: 'hidden' }}>
        {/* 左側: 打順表示 */}
        <div style={{ 
          width: '300px', 
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
                        <div style={{ marginBottom: '2px' }}>{player.name}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, display: 'flex', gap: '8px' }}>
                          <span>{player.team}</span>
                          <span>打率: {calculateBattingAverage(player)}</span>
                          <span>本塁打: {player.HR}</span>
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

        {/* 右側: 選手選択テーブル */}
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
      </main>
    </div>
  )
}

export default App