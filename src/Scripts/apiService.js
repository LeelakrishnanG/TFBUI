import axios from 'axios';

// API endpoints mapping
const endpointMap = {
  tpavalidation: 'http://localhost:8080/api/tpa/TPAvalidation',
  npivalidation: 'http://localhost:8080/api/npi/NPIvalidation',
  ndcandselfadminvalidation: 'http://localhost:8080/api/ndc/NDCvalidation',
};

// Default filename mapping
const filenameMap = {
  tpavalidation: 'TPAResults.txt',
  npivalidation: 'NPIResults.txt',
  ndcandselfadminvalidation: 'NDCResults.txt',
};

/**
 * Validates the file upload and sends it to the appropriate API endpoint
 * @param {string} validationType - The type of validation (tpavalidation, npivalidation, ndcandselfadminvalidation)
 * @param {File} testFile - The test file to upload
 * @param {File} dbFile - The database file to upload
 * @param {File} coveredEntityFile - The covered entity file (optional, required for NPI validation)
 * @returns {Promise<Object>} Response object with file data and metadata
 */
export const uploadFilesForValidation = async (validationType, testFile, dbFile, coveredEntityFile = null) => {
  try {
    // Get the appropriate endpoint
    const endpoint = endpointMap[validationType];
    if (!endpoint) {
      throw new Error(`Invalid validation type: ${validationType}`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('testFile', testFile);
    formData.append('dbFile', dbFile);
    
    // Add covered entity file if provided (required for NPI validation)
    if (coveredEntityFile) {
      formData.append('coveredEntityFile', coveredEntityFile);
    }

    // Make the API call
    const response = await axios.post(endpoint, formData, {
      responseType: 'blob'
    });

    // Determine the filename
    let filename = filenameMap[validationType] || 'Results.txt';
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
    }

    return {
      success: true,
      data: response.data,
      filename: filename,
      headers: response.headers
    };

  } catch (error) {
    console.error('Error uploading files:', error);
    return {
      success: false,
      error: error.message || 'File upload failed!',
      data: null,
      filename: null
    };
  }
};

/**
 * Downloads a file by creating a temporary link and clicking it
 * @param {Blob} fileData - The file data blob
 * @param {string} filename - The filename for the download
 */
export const downloadFile = (fileData, filename) => {
  const url = URL.createObjectURL(fileData);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up memory
};

/**
 * Reads file content as text
 * @param {Blob} fileData - The file data blob
 * @returns {Promise<string>} The file content as text
 */
export const readFileContent = (fileData) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result);
    };
    reader.onerror = function(e) {
      reject(new Error('Failed to read file content'));
    };
    reader.readAsText(fileData);
  });
};
