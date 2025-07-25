import { useState, useMemo } from 'react'
import { Player } from '../types/Player'
import { theme } from '../styles/atlassian-theme'

interface PlayerTableProps {
  players: Player[]
  selectedPlayers: Player[]
  onPlayerAdd: (player: Player) => void
}

export const PlayerTable = ({ 
  players, 
  selectedPlayers, 
  onPlayerAdd 
}: PlayerTableProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all')

  // 利用可能なチーム一覧を動的に生成
  const availableTeams = useMemo(() => {
    const teams = Array.from(new Set(players.map(player => player.チーム)))
    return teams.sort()
  }, [players])

  const filteredPlayers = useMemo(() => {
    if (selectedTeam === 'all') return players
    return players.filter(player => player.チーム === selectedTeam)
  }, [players, selectedTeam])

  // 新しいデータ形式では既に計算済みの値を使用

  const getPlayerSelectCount = (player: Player) => {
    return selectedPlayers.filter(selected => 
      selected.チーム === player.チーム && selected.背番号 === player.背番号 && selected.選手名 === player.選手名
    ).length
  }

  const canAddMore = selectedPlayers.length < 9

  const handlePlayerAdd = (player: Player) => {
    if (canAddMore) {
      onPlayerAdd(player)
    }
  }

  return (
    <div>
      <div style={{ 
        marginBottom: theme.spacing.xl, 
        display: 'flex', 
        alignItems: 'center', 
        gap: theme.spacing.xl 
      }}>
        <div>
          <label htmlFor="team-select" style={{ 
            marginRight: theme.spacing.sm, 
            fontWeight: theme.typography.fontWeight.medium, 
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.base
          }}>
            選手絞り込み:
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{ 
              padding: `${theme.spacing.sm} ${theme.spacing.md}`, 
              fontSize: theme.typography.fontSize.base, 
              borderRadius: theme.borderRadius.sm, 
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              outline: 'none'
            }}
          >
            <option value="all">全選手</option>
            {availableTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        
        <div style={{ 
          padding: `${theme.spacing.sm} ${theme.spacing.md}`, 
          backgroundColor: selectedPlayers.length === 9 ? theme.colors.successLight : theme.colors.background,
          borderRadius: theme.borderRadius.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: selectedPlayers.length === 9 ? theme.colors.success : theme.colors.text,
          border: `1px solid ${selectedPlayers.length === 9 ? theme.colors.success : theme.colors.border}`
        }}>
          選択中: {selectedPlayers.length}/9名
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: theme.typography.fontSize.base,
          minWidth: '800px',
          backgroundColor: theme.colors.surface
        }}>
          <thead>
            <tr style={{ backgroundColor: theme.colors.background }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>チーム</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>背番号</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>選手名</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>打率</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>打席</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>单打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>二塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>三塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>本塁打</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>三振</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>四球</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', color: '#333' }}>死球</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', width: '80px', color: '#333' }}>追加</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => {
              const selectCount = getPlayerSelectCount(player)
              return (
                <tr 
                  key={`${player.背番号}-${player.選手名}-${index}`}
                  style={{ 
                    backgroundColor: selectCount > 0 ? '#e3f2fd' : 'white',
                    color: '#333',
                    opacity: !canAddMore ? 0.7 : 1
                  }}
                >
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: '#333', textAlign: 'center' }}>{player.チーム}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: '#333', textAlign: 'center' }}>{player.背番号}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', color: '#333', fontWeight: selectCount > 0 ? 'bold' : 'normal' }}>
                    {player.選手名}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>
                    {player.打率.toFixed(3)}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.打席数}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.安打 - player.二塁打 - player.三塁打 - player.本塁打}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.二塁打}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.三塁打}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.本塁打}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.三振}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.四球}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', color: '#333' }}>{player.死球}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => handlePlayerAdd(player)}
                      disabled={!canAddMore}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: canAddMore ? '#2196f3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: canAddMore ? 'pointer' : 'not-allowed',
                        minWidth: '50px'
                      }}
                    >
                      追加
                      {selectCount > 0 && (
                        <span style={{ 
                          marginLeft: '4px', 
                          backgroundColor: 'rgba(255,255,255,0.3)', 
                          borderRadius: '50%', 
                          padding: '2px 6px',
                          fontSize: '10px'
                        }}>
                          {selectCount}
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredPlayers.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          該当する選手がいません
        </p>
      )}

      {selectedPlayers.length === 9 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '4px',
          border: '1px solid #4caf50'
        }}>
          <strong>✓ 9名の選手が選択されました！打順編集に進めます。</strong>
        </div>
      )}
    </div>
  )
}