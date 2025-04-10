import React, { useState, useEffect } from 'react';
import { useCases } from '../src/data/useCases.js';
import { formats } from '../src/data/formats.js';
import UseCaseCard from '../src/components/UseCaseCard.js';
import FormatCard from '../src/components/FormatCard.js';
import ProgressIndicator from '../src/components/ProgressIndicator.js';
import FileUploader from '../src/components/FileUploader.js';

export default function Home() {
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [filteredFormats, setFilteredFormats] = useState(formats);
  const [isFormatSectionActive, setIsFormatSectionActive] = useState(false);
  const [isUploadSectionActive, setIsUploadSectionActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isConversionComplete, setIsConversionComplete] = useState(false);

  // Update filtered formats when use case changes
  useEffect(() => {
    if (selectedUseCase) {
      const selectedUseCaseObj = useCases.find(uc => uc.id === selectedUseCase);
      if (selectedUseCaseObj && selectedUseCaseObj.recommendedFormats) {
        setFilteredFormats(formats);
        setIsFormatSectionActive(true);
        setCurrentStep(2);
      } else {
        setFilteredFormats(formats);
        setIsFormatSectionActive(true);
      }
    } else {
      setIsFormatSectionActive(false);
      setFilteredFormats(formats);
    }
    // Reset selected format when changing use case
    setSelectedFormat('');
  }, [selectedUseCase]);

  // Update steps when format is selected
  useEffect(() => {
    if (selectedFormat) {
      setIsUploadSectionActive(true);
      setCurrentStep(3);
      setValidationError('');
    } else {
      setIsUploadSectionActive(false);
    }
  }, [selectedFormat]);

  const handleUseCaseSelect = (useCaseId) => {
    setSelectedUseCase(useCaseId);
    if (validationError) setValidationError('');
    // Reset uploaded file when changing use case
    setUploadedFile(null);
    setIsConversionComplete(false);
  };

  const handleFormatSelect = (formatId) => {
    setSelectedFormat(formatId);
    if (validationError) setValidationError('');
    // Reset uploaded file when changing format
    setUploadedFile(null);
    setIsConversionComplete(false);
  };

  const handleFileUploaded = async (fileData) => {
    setUploadedFile(fileData);
    
    try {
      // Detect if we need OCR based on file type
      const fileExt = fileData.file.originalname.split('.').pop().toLowerCase();
      const mightNeedOcr = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'pdf'].includes(fileExt);
      
      // Default OCR to enabled based on file type
      const useOcr = mightNeedOcr;
      
      // Now trigger the actual conversion
      const response = await fetch('http://localhost:3333/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileData.file.filename,
          targetFormat: selectedFormat,
          useCase: selectedUseCase,
          options: {
            useOcr: useOcr,
            language: 'eng' // Default to English
          }
        }),
      });
      
      const conversionResult = await response.json();
      
      if (conversionResult.success) {
        // Update the upload result with conversion information
        setUploadedFile({
          ...fileData,
          conversion: conversionResult.conversion
        });
        setIsConversionComplete(true);
      } else {
        setValidationError(conversionResult.message || 'Error converting file');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setValidationError('Network error during conversion');
    }
  };

  const handleContinue = () => {
    if (!selectedUseCase) {
      setValidationError('Please select a use case to continue');
      setCurrentStep(1);
      return;
    }
    
    if (!selectedFormat) {
      setValidationError('Please select an output format to continue');
      setCurrentStep(2);
      return;
    }
    
    if (!uploadedFile && currentStep === 3) {
      setValidationError('Please upload a file to continue');
      return;
    }
    
    if (uploadedFile && isConversionComplete && uploadedFile.conversion) {
      // Download the converted file
      window.open(`http://localhost:3333${uploadedFile.conversion.downloadUrl}`, '_blank');
    }
  };
  
  // Function to preview text content
  const handlePreview = async () => {
    if (!uploadedFile || !uploadedFile.conversion) return;
    
    // Only try to preview text files
    const extension = uploadedFile.conversion.fileName.split('.').pop().toLowerCase();
    if (extension === 'txt' || extension === 'md' || extension === 'html' || extension === 'json' || extension === 'csv') {
      try {
        const response = await fetch(`http://localhost:3333/api/preview/${uploadedFile.conversion.fileName}`);
        const result = await response.json();
        
        if (result.success) {
          // In a real app, you'd show this in a modal/preview pane
          alert(`Content preview:\n\n${result.content.substring(0, 1000)}${result.content.length > 1000 ? '...' : ''}`);
        } else {
          setValidationError('Error loading preview: ' + result.message);
        }
      } catch (error) {
        console.error('Preview error:', error);
        setValidationError('Network error loading preview');
      }
    } else {
      // For non-text files, just download
      window.open(`http://localhost:3333${uploadedFile.conversion.downloadUrl}`, '_blank');
    }
  };

  // Check if a format is recommended for the selected use case
  const isFormatRecommended = (formatId) => {
    if (!selectedUseCase) return false;
    
    const selectedUseCaseObj = useCases.find(uc => uc.id === selectedUseCase);
    if (!selectedUseCaseObj || !selectedUseCaseObj.recommendedFormats) return false;
    
    return selectedUseCaseObj.recommendedFormats.includes(formatId);
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Document Conversion & Use-Case Selector</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Select a use case and target format for your document conversion</p>
        
        <ProgressIndicator currentStep={currentStep} />
      </header>

      {validationError && (
        <div style={{ 
          backgroundColor: '#fff5f5', 
          color: '#e53e3e', 
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          border: '1px solid #fed7d7',
          fontSize: '0.9rem'
        }}>
          {validationError}
        </div>
      )}

      <section style={{ 
        marginBottom: '2.5rem',
        opacity: currentStep === 1 ? 1 : 0.8,
        transition: 'opacity 0.3s ease'
      }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            backgroundColor: currentStep >= 1 ? '#0070f3' : '#e1e1e1', 
            color: currentStep >= 1 ? 'white' : '#666', 
            borderRadius: '50%', 
            width: '28px', 
            height: '28px', 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>1</span>
          Select a Use Case
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {useCases.map(useCase => (
            <UseCaseCard 
              key={useCase.id}
              useCase={useCase}
              selected={selectedUseCase === useCase.id}
              onClick={() => handleUseCaseSelect(useCase.id)}
            />
          ))}
        </div>
      </section>

      <section style={{ 
        marginBottom: '2.5rem', 
        opacity: isFormatSectionActive ? (currentStep === 2 ? 1 : 0.8) : 0.6,
        pointerEvents: isFormatSectionActive ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            backgroundColor: currentStep >= 2 ? '#0070f3' : '#e1e1e1', 
            color: currentStep >= 2 ? 'white' : '#666', 
            borderRadius: '50%', 
            width: '28px', 
            height: '28px', 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>2</span>
          Select Output Format
        </h2>
        
        {selectedUseCase && (
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Showing format options for <strong>{useCases.find(uc => uc.id === selectedUseCase)?.name}</strong>. 
            Recommended formats are highlighted.
          </p>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          {filteredFormats.map(format => (
            <FormatCard 
              key={format.id}
              format={format}
              selected={selectedFormat === format.id}
              recommended={isFormatRecommended(format.id)}
              onClick={() => handleFormatSelect(format.id)}
            />
          ))}
        </div>
      </section>

      <section style={{ 
        marginBottom: '2rem',
        opacity: isUploadSectionActive ? (currentStep === 3 ? 1 : 0.8) : 0.6,
        pointerEvents: isUploadSectionActive ? 'auto' : 'none',
        transition: 'opacity 0.3s ease'
      }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            backgroundColor: currentStep >= 3 ? '#0070f3' : '#e1e1e1', 
            color: currentStep >= 3 ? 'white' : '#666', 
            borderRadius: '50%', 
            width: '28px', 
            height: '28px', 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginRight: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>3</span>
          Upload Document
        </h2>
        
        <FileUploader 
          useCase={selectedUseCase}
          format={selectedFormat}
          onFileUploaded={handleFileUploaded}
          disabled={!selectedUseCase || !selectedFormat}
        />
        
        {isConversionComplete && uploadedFile && uploadedFile.conversion && (
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #dcfce7',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h3 style={{ color: '#16a34a', marginTop: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.5rem' }}>✅</span> 
              Conversion Complete
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
              Your file <strong>{uploadedFile.file?.originalname}</strong> has been converted to <strong>{formats.find(f => f.id === selectedFormat)?.name}</strong>.
            </p>
            
            {uploadedFile.conversion.usedOcr && (
              <div style={{ 
                margin: '0.5rem 0',
                padding: '0.5rem',
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: '#92400e'
              }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1rem' }}>ℹ️</span>
                  OCR was used to extract text from this document.
                </p>
              </div>
            )}
            
            <div style={{ margin: '1rem 0 0 0', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handlePreview}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  backgroundColor: 'white',
                  color: '#0070f3',
                  border: '1px solid #0070f3',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Preview
              </button>
              <button
                onClick={() => window.open(`http://localhost:3333${uploadedFile.conversion.downloadUrl}`, '_blank')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Download
              </button>
            </div>
          </div>
        )}
      </section>

      {!isConversionComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleContinue}
            style={{ 
              padding: '0.75rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '500',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 118, 255, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            Continue
          </button>
        </div>
      )}

      <footer style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem', color: '#666' }}>
        <p>Document Conversion App - Phase 6</p>
      </footer>
    </div>
  );
}