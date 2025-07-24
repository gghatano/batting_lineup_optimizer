import './App.css'
import { usePlayers } from './hooks/usePlayers'
import { Player, TeamName } from './types/Player'

function App() {
  const { data: players, isLoading, error } = usePlayers()

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

  const teamCounts = players?.reduce((acc, player) => {
    acc[player.team as TeamName] = (acc[player.team as TeamName] || 0) + 1
    return acc
  }, {} as Record<TeamName, number>) || {}

  return (
    <div className="App">
      <header className="App-header">
        <h1>野球打順最適化アプリ</h1>
        <p>選手データ読み込み完了: {players?.length || 0}名</p>
      </header>
      
      <main style={{ padding: '20px', textAlign: 'left' }}>
        <h2>球団別選手数</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {Object.entries(teamCounts).map(([team, count]) => (
            <div key={team} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <strong>{team}</strong>: {count as number}名
            </div>
          ))}
        </div>

        <h2>選手一覧（先頭10名）</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>球団</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>名前</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>打席</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>単打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>二塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>三塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>本塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>三振</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>四球</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>その他アウト</th>
            </tr>
          </thead>
          <tbody>
            {(players || []).slice(0, 10).map((player: Player, index: number) => (
              <tr key={`${player.team}-${player.name}-${index}`}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.team}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.PA}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player['1B']}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player['2B']}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player['3B']}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.HR}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.SO}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.BB}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.OUT_OTHER}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {players && players.length > 10 && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            ...他{players.length - 10}名
          </p>
        )}
      </main>
    </div>
  )
}

export default App