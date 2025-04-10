import React from 'react';
import { styles } from '../theme';

/**
 * Alert component for displaying messages
 * @param {Object} props
 * @param {string} props.variant - Alert variant (success, error, warning, info)
 * @param {React.ReactNode} props.children - Alert content
 * @param {React.CSSProperties} props.style - Additional styles
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {Function} props.onDismiss - Dismiss handler
 * @returns {React.ReactElement}
 */
const Alert = ({
  variant = 'info',
  children,
  style = {},
  dismissible = false,
  onDismiss,
  ...rest
}) => {
  // Get base alert style from theme
  const baseStyle = styles.alert[variant] || styles.alert.info;

  // Combine styles
  const alertStyle = {
    ...baseStyle,
    position: 'relative',
    ...style,
  };

  return (
    <div style={alertStyle} role="alert" {...rest}>
      {dismissible && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'inherit',
            opacity: 0.7,
          }}
          aria-label="Close"
        >
          &times;
        </button>
      )}
      {children}
    </div>
  );
};

export default Alert;