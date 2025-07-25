import React from 'react'
import { theme } from '../styles/atlassian-theme'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
  title?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  style,
  title,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.textMuted : theme.colors.primary,
          color: theme.colors.secondary,
          border: 'none',
          '&:hover': {
            backgroundColor: disabled ? theme.colors.textMuted : theme.colors.primaryHover,
          },
        }
      case 'danger':
        return {
          backgroundColor: disabled ? theme.colors.textMuted : theme.colors.danger,
          color: theme.colors.secondary,
          border: 'none',
          '&:hover': {
            backgroundColor: disabled ? theme.colors.textMuted : theme.colors.dangerHover,
          },
        }
      case 'secondary':
      default:
        return {
          backgroundColor: disabled ? theme.colors.background : theme.colors.secondary,
          color: disabled ? theme.colors.textMuted : theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          '&:hover': {
            backgroundColor: disabled ? theme.colors.background : theme.colors.secondaryHover,
          },
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          minHeight: '28px',
        }
      case 'lg':
        return {
          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
          fontSize: theme.typography.fontSize.lg,
          minHeight: '44px',
        }
      case 'md':
      default:
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.typography.fontSize.base,
          minHeight: '36px',
        }
    }
  }

  const baseStyles: React.CSSProperties = {
    borderRadius: theme.borderRadius.sm,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: disabled ? 'none' : theme.shadows.sm,
    opacity: disabled ? 0.6 : 1,
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  }

  return (
    <button
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = theme.colors.primaryHover
        } else if (!disabled && variant === 'danger') {
          e.currentTarget.style.backgroundColor = theme.colors.dangerHover
        } else if (!disabled && variant === 'secondary') {
          e.currentTarget.style.backgroundColor = theme.colors.secondaryHover
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.backgroundColor = theme.colors.primary
        } else if (!disabled && variant === 'danger') {
          e.currentTarget.style.backgroundColor = theme.colors.danger
        } else if (!disabled && variant === 'secondary') {
          e.currentTarget.style.backgroundColor = theme.colors.secondary
        }
      }}
    >
      {children}
    </button>
  )
}