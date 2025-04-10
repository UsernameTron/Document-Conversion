import React from 'react';

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, name: 'Select Use Case' },
    { number: 2, name: 'Choose Format' },
    { number: 3, name: 'Upload Document' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '600px',
      margin: '0 auto 2rem auto',
      position: 'relative'
    }}>
      {/* Connecting line */}
      <div style={{
        position: 'absolute',
        height: '2px',
        backgroundColor: '#e1e1e1',
        width: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 0
      }} />

      {steps.map((step) => (
        <div key={step.number} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
          backgroundColor: 'white',
          padding: '0 1rem'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: step.number <= currentStep ? '#0070f3' : 'white',
            color: step.number <= currentStep ? 'white' : '#333',
            border: step.number <= currentStep ? 'none' : '1px solid #ddd',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            boxShadow: step.number === currentStep ? '0 2px 8px rgba(0, 112, 243, 0.3)' : 'none'
          }}>
            {step.number}
          </div>
          <div style={{
            fontWeight: step.number === currentStep ? 'bold' : 'normal',
            color: step.number === currentStep ? '#0070f3' : '#666',
            fontSize: '0.875rem'
          }}>
            {step.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;