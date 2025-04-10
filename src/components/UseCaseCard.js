import React from 'react';
import Card from './Card';

/**
 * Component for displaying a use case card
 * @param {Object} props
 * @param {Object} props.useCase - Use case data
 * @param {boolean} props.selected - Whether the use case is selected
 * @param {Function} props.onClick - Click handler
 * @returns {React.ReactElement}
 */
const UseCaseCard = ({ useCase, selected, onClick }) => {
  return (
    <Card
      interactive={true}
      selected={selected}
      onClick={onClick}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      aria-label={`Select use case: ${useCase.name}`}
      role="button"
      tabIndex={0}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{useCase.icon}</div>
      <h3 style={{ margin: '0 0 0.75rem 0', color: selected ? '#0070f3' : '#333' }}>{useCase.name}</h3>
      <p style={{ margin: '0', color: '#666', fontSize: '0.9rem', flex: 1 }}>{useCase.description}</p>
      
      {selected && (
        <div style={{ 
          marginTop: '1rem', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px',
          fontSize: '0.8rem',
          display: 'inline-block',
          alignSelf: 'flex-start'
        }}>
          Selected
        </div>
      )}
    </Card>
  );
};

export default UseCaseCard;