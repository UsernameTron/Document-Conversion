import React from 'react';
import { styles } from '../theme';

/**
 * Button component
 * @param {Object} props
 * @param {string} props.variant - Button variant (primary, secondary, success, danger)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {React.CSSProperties} props.style - Additional styles
 * @param {string} props.type - Button type (button, submit, reset)
 * @returns {React.ReactElement}
 */
const Button = ({ 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  style = {},
  type = 'button',
  ...rest
}) => {
  // Size styles
  const sizeStyles = {
    sm: { 
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem'
    },
    md: { 
      padding: '0.5rem 1rem',
      fontSize: '1rem'
    },
    lg: { 
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem'
    }
  };

  // Get base button style from theme
  const baseStyle = styles.button[variant] || styles.button.primary;

  // Combine styles
  const buttonStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    ...(disabled ? styles.button.disabled : {}),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;