import React from 'react'
import { theme } from '../styles/atlassian-theme'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.secondary,
        }
      case 'success':
        return {
          backgroundColor: theme.colors.successLight,
          color: theme.colors.success,
        }
      case 'warning':
        return {
          backgroundColor: theme.colors.warningLight,
          color: theme.colors.warning,
        }
      case 'danger':
        return {
          backgroundColor: theme.colors.dangerLight,
          color: theme.colors.danger,
        }
      case 'default':
      default:
        return {
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.xs,
          minHeight: '20px',
        }
      case 'md':
      default:
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.typography.fontSize.sm,
          minHeight: '24px',
        }
    }
  }

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    fontWeight: theme.typography.fontWeight.medium,
    border: `1px solid ${theme.colors.border}`,
    whiteSpace: 'nowrap',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  }

  return (
    <span style={baseStyles}>
      {children}
    </span>
  )
}