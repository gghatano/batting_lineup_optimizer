import React from 'react'
import { theme } from '../styles/atlassian-theme'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  style?: React.CSSProperties
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = theme.colors.primary,
  style,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return '16px'
      case 'lg':
        return '32px'
      case 'md':
      default:
        return '24px'
    }
  }

  const sizeValue = getSizeValue()

  const spinnerStyles: React.CSSProperties = {
    display: 'inline-block',
    width: sizeValue,
    height: sizeValue,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: '50%',
    borderTopColor: color,
    animation: 'spin 1s ease-in-out infinite',
    ...style,
  }

  // Add keyframe animation via style tag (for simplicity)
  React.useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return <div style={spinnerStyles} />
}

export interface LoadingStateProps {
  children: React.ReactNode
  message?: string
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  children,
  message = '読み込み中...',
  size = 'md',
  style,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    textAlign: 'center',
    ...style,
  }

  const textStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    fontWeight: theme.typography.fontWeight.normal,
  }

  return (
    <div style={containerStyles}>
      <LoadingSpinner size={size} />
      <div style={textStyles}>{message}</div>
      {children}
    </div>
  )
}