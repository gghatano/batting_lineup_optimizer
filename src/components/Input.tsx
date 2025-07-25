import React from 'react'
import { theme } from '../styles/atlassian-theme'

export interface InputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: 'text' | 'url' | 'number' | 'email'
  disabled?: boolean
  error?: boolean
  style?: React.CSSProperties
  id?: string
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = false,
  style,
  id,
}) => {
  const baseStyles: React.CSSProperties = {
    width: '100%',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    lineHeight: theme.typography.lineHeight.base,
    color: disabled ? theme.colors.textMuted : theme.colors.text,
    backgroundColor: disabled ? theme.colors.background : theme.colors.surface,
    border: `2px solid ${error ? theme.colors.danger : theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    outline: 'none',
    transition: 'all 0.2s ease',
    minHeight: '36px',
    boxSizing: 'border-box',
    ...style,
  }

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={baseStyles}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = error ? theme.colors.danger : theme.colors.primary
          e.currentTarget.style.boxShadow = `0 0 0 2px ${error ? theme.colors.dangerLight : 'rgba(38, 132, 255, 0.2)'}`
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? theme.colors.danger : theme.colors.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}