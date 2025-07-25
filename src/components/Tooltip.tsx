import React, { useState } from 'react'
import { theme } from '../styles/atlassian-theme'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
      backgroundColor: theme.colors.text,
      color: theme.colors.secondary,
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      borderRadius: theme.borderRadius.sm,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.base,
      boxShadow: theme.shadows.lg,
      pointerEvents: 'none' as const,
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' as const : 'hidden' as const,
      transition: 'opacity 0.2s ease, visibility 0.2s ease',
      maxWidth: '300px',
      whiteSpace: 'normal' as const,
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: theme.spacing.xs,
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: theme.spacing.xs,
        }
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: theme.spacing.xs,
        }
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: theme.spacing.xs,
        }
      default:
        return baseStyles
    }
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div style={getPositionStyles()}>
        {content}
      </div>
    </div>
  )
}

// アイコンコンポーネント
export const InfoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const sizeMap = {
    sm: '14px',
    md: '16px',
    lg: '18px'
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: '50%',
      backgroundColor: theme.colors.primary,
      color: theme.colors.secondary,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      cursor: 'help',
      flexShrink: 0,
      marginLeft: theme.spacing.xs
    }}>
      ?
    </div>
  )
}