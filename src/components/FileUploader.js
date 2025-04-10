import React, { useState, useRef } from 'react';

const FileUploader = ({ useCase, format, onFileUploaded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    // Reset any previous upload state
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'text/markdown',
      'text/html',
      'application/json'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file type. Only documents, spreadsheets, and text files are allowed.');
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMessage('File is too large. Maximum size is 100MB.');
      return;
    }
    
    setFile(selectedFile);
  };

  // Handle file input change
  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle click on the dropzone
  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !useCase || !format) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('useCase', useCase);
    formData.append('format', format);
    
    try {
      // Use XMLHttpRequest for progress tracking (fetch doesn't support progress natively)
      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
        
        // Handle completion
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid JSON response from server'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        
        // Handle network errors
        xhr.onerror = function() {
          reject(new Error('Network error during upload'));
        };
        
        // Open and send the request
        xhr.open('POST', 'http://localhost:3333/api/upload');
        xhr.send(formData);
      });
      
      const data = await uploadPromise;
      
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Notify parent component of successful upload
      if (onFileUploaded) {
        onFileUploaded(data);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Error uploading file');
      console.error('Upload error:', error);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      
      {!file ? (
        // File drop zone
        <div
          style={{
            padding: '2rem',
            border: isDragging ? '2px dashed #0070f3' : '2px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: isDragging ? '#f0f7ff' : '#f9fafb',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
          onClick={disabled ? undefined : handleDropzoneClick}
          onDragEnter={disabled ? undefined : handleDragEnter}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDragOver={disabled ? undefined : handleDragOver}
          onDrop={disabled ? undefined : handleDrop}
        >
          <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📄</div>
          <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
            {isDragging ? 'Drop your file here' : 'Drag and drop your file here or click to browse'}
          </p>
          <button
            disabled={disabled}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              fontWeight: '500'
            }}
          >
            Select File
          </button>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
            Supported formats: PDF, Word, Excel, PowerPoint, Text, CSV, Markdown, HTML, JSON
          </p>
        </div>
      ) : (
        // File selected view
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>
              {file.type.includes('pdf') ? '📑' :
               file.type.includes('word') ? '📝' :
               file.type.includes('excel') || file.type.includes('csv') ? '📊' :
               file.type.includes('presentation') ? '🖼️' :
               file.type.includes('text') ? '📄' : '📁'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{file.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0.25rem'
              }}
            >
              ✕
            </button>
          </div>
          
          {uploadStatus === 'uploading' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#0070f3',
                  transition: 'width 0.2s ease'
                }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#ecfdf5', 
              color: '#047857',
              borderRadius: '4px',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              File uploaded successfully!
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#fff5f5', 
              color: '#e53e3e',
              borderRadius: '4px',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              {errorMessage || 'Error uploading file. Please try again.'}
            </div>
          )}
          
          {uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={disabled || uploadStatus === 'uploading'}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                fontWeight: '500',
                width: '100%'
              }}
            >
              Upload File
            </button>
          )}
        </div>
      )}
      
      {errorMessage && !file && (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#fff5f5', 
          color: '#e53e3e',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FileUploader;