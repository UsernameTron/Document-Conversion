import React from 'react';
import { styles } from '../theme';

/**
 * Card component
 * @param {Object} props
 * @param {boolean} props.interactive - Whether the card is interactive
 * @param {boolean} props.selected - Whether the card is selected
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onClick - Click handler
 * @param {React.CSSProperties} props.style - Additional styles
 * @returns {React.ReactElement}
 */
const Card = ({
  interactive = false,
  selected = false,
  children,
  onClick,
  style = {},
  ...rest
}) => {
  // Combine styles
  const cardStyle = {
    ...styles.card.default,
    ...(interactive ? styles.card.interactive : {}),
    ...(selected ? styles.card.selected : {}),
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onClick={interactive ? onClick : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;