import React from 'react'
import { Player } from '../types/Player'
import { Button } from './Button'
import { theme } from '../styles/atlassian-theme'

interface LineupDisplayProps {
  players: Player[]
  onBackToSelection: () => void
  title?: string
}

export const LineupDisplay: React.FC<LineupDisplayProps> = ({
  players,
  onBackToSelection,
  title = '現在の打順'
}) => {
  const calculateBattingAverage = (player: Player) => {
    return player.打率.toFixed(3)
  }

  return (
    <div style={{
      width: '280px',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text,
          fontWeight: theme.typography.fontWeight.semibold
        }}>
          {title}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToSelection}
        >
          選手変更
        </Button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm
      }}>
        {players.map((player, index) => (
          <div
            key={`lineup-${index}-${player.背番号}`}
            style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary,
              color: theme.colors.secondary,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
              boxShadow: theme.shadows.sm,
              minHeight: '50px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={{
                minWidth: '20px',
                fontWeight: theme.typography.fontWeight.bold,
                marginRight: theme.spacing.sm
              }}>
                {index + 1}.
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '2px' }}>
                  {player.選手名}
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  opacity: 0.8,
                  display: 'flex',
                  gap: theme.spacing.xs
                }}>
                  <span>{player.チーム}</span>
                  <span>#{player.背番号}</span>
                  <span>{calculateBattingAverage(player)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 打順統計 */}
      <div style={{
        marginTop: theme.spacing.xl,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.border}`
      }}>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm
        }}>
          打順統計
        </div>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textSubtle,
          lineHeight: theme.typography.lineHeight.relaxed
        }}>
          <div>
            平均打率: {(players.reduce((acc, p) => acc + p.打率, 0) / players.length).toFixed(3)}
          </div>
          <div>
            総本塁打: {players.reduce((acc, p) => acc + p.本塁打, 0)}本
          </div>
          <div>
            総打点: {players.reduce((acc, p) => acc + p.打点, 0)}点
          </div>
        </div>
      </div>
    </div>
  )
}