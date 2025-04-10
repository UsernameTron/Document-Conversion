import React from 'react';

const FormatCard = ({ format, selected, recommended, onClick }) => {
  return (
    <div 
      className={`format-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`}
      style={{ 
        padding: '1rem', 
        border: selected ? '2px solid #0070f3' : recommended ? '1px solid #0070f3' : '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: selected ? '#f0f7ff' : recommended ? '#f8faff' : 'white',
        transition: 'all 0.2s ease',
        opacity: recommended || !selected ? '1' : '0.7',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{format.icon}</span>
        <h3 style={{ margin: '0', color: selected ? '#0070f3' : '#333', fontSize: '1rem' }}>{format.name}</h3>
      </div>
      <p style={{ margin: '0', color: '#666', fontSize: '0.85rem', flex: '1' }}>{format.description}</p>
      
      {recommended && !selected && (
        <div style={{ 
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '0.15rem 0.4rem', 
          borderRadius: '4px',
          fontSize: '0.7rem',
        }}>
          Recommended
        </div>
      )}
      
      {selected && (
        <div style={{ 
          marginTop: '0.75rem', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          padding: '0.15rem 0.4rem', 
          borderRadius: '4px',
          fontSize: '0.7rem',
          display: 'inline-block',
          alignSelf: 'flex-start'
        }}>
          Selected
        </div>
      )}
    </div>
  );
};

export default FormatCard;