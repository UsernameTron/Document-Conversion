// This is a workaround for the file upload progress tracking
// Since fetch doesn't support progress tracking natively, we need to use XMLHttpRequest
// This function will be used in the FileUploader component

export const uploadFileWithProgress = async (url, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Setup progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        if (onProgress) {
          onProgress(percentComplete);
        }
      }
    });
    
    // Setup completion handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({ ok: true, data: response });
        } catch (error) {
          resolve({ ok: true, data: xhr.responseText });
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject({ 
            ok: false, 
            status: xhr.status, 
            message: errorResponse.message || 'Upload failed' 
          });
        } catch (error) {
          reject({ 
            ok: false, 
            status: xhr.status, 
            message: 'Upload failed' 
          });
        }
      }
    });
    
    // Setup error handler
    xhr.addEventListener('error', () => {
      reject({ 
        ok: false, 
        status: xhr.status, 
        message: 'Network error during upload' 
      });
    });
    
    // Setup abort handler
    xhr.addEventListener('abort', () => {
      reject({ 
        ok: false, 
        status: xhr.status, 
        message: 'Upload was aborted' 
      });
    });
    
    // Open and send the request
    xhr.open('POST', url);
    xhr.send(formData);
  });
};