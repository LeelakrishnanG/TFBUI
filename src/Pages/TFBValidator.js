import React, { useState, useRef } from 'react';
import '../CSS/tfbvalidatorCSS.css';
import { uploadFilesForValidation, downloadFile, readFileContent } from '../Scripts/apiService';

function TFBValidator() {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [testFile, setTestFile] = useState(null);
  const [dbFile, setDbFile] = useState(null);
  const [coveredEntityFile, setCoveredEntityFile] = useState(null);
  const [uploadResult, setUploadResult] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadedFileContent, setDownloadedFileContent] = useState('');
  const [downloadedFileName, setDownloadedFileName] = useState('');

  const testFileRef = useRef();
  const dbFileRef = useRef();
  const coveredEntityRef = useRef();

  const handleChange = (event) => {
    setSelected(event.target.value);
    setTestFile(null);
    setDbFile(null);
    setCoveredEntityFile(null);
    if (testFileRef.current) testFileRef.current.value = '';
    if (dbFileRef.current) dbFileRef.current.value = '';
    if (coveredEntityRef.current) coveredEntityRef.current.value = '';
  };

  const showThirdFileInput = selected === 'npivalidation';

  const validateXLSX = (file) => {
    if (file && file.name.endsWith('.xlsx')) {
      return file;
    } else {
      alert('Please upload a valid .xlsx file.');
      return null;
    }
  };

  const isSendEnabled = () => {
    if (isLoading) return false;
    if (selected === '') return false;
    if (!testFile || !dbFile) return false;
    if (showThirdFileInput && !coveredEntityFile) return false;
    return true;
  };

  const handleSend = async () => {
    if (!isSendEnabled()) return;

    try {
      setIsLoading(true);
      setUploadResult('');
      
      // Call the API service
      const result = await uploadFilesForValidation(
        selected,
        testFile,
        dbFile,
        showThirdFileInput ? coveredEntityFile : null
      );

      if (result.success) {
        setIsSuccess(true);
        setUploadResult('File sent successfully!');
        console.log('Response:', result.data);
        
        // Download the file
        downloadFile(result.data, result.filename);
        
        // Read and store file content for display in the parallel container
        const fileContent = await readFileContent(result.data);
        setDownloadedFileContent(fileContent);
        setDownloadedFileName(result.filename);
        
        // Clear the form
        if (testFileRef.current) testFileRef.current.value = '';
        if (dbFileRef.current) dbFileRef.current.value = '';
        if (coveredEntityRef.current) coveredEntityRef.current.value = '';
        setTestFile(null);
        setDbFile(null);
        setCoveredEntityFile(null);
        
      } else {
        setUploadResult(result.error);
        setIsSuccess(false);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      setUploadResult('An unexpected error occurred!');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFile = () => {
    if (downloadedFileContent) {
      const blob = new Blob([downloadedFileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="containers-wrapper">
        <div className="tfb-validator-container">
        <label htmlFor="toolselection">Choose the tool:</label>
        <select id="toolselection" value={selected} onChange={handleChange}>
          <option value="" disabled hidden>-- Select --</option>
          <option value="tpavalidation">TPA Validation</option>
          <option value="npivalidation">NPI Validation</option>
          <option value="ndcandselfadminvalidation">NDC / SA Validation</option>
        </select>

        {selected && selected !== '' && (
          <div className="sendFiles">
            <div className="file-input-container">
              <label>Test File *</label>
              <div className="custom-file-input">
                <label htmlFor="testFile" className="file-input-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span className="file-name">{testFile ? testFile.name : 'Choose file'}</span>
                </label>
                <input
                  id="testFile"
                  type="file"
                  accept=".xlsx"
                  ref={testFileRef}
                  onChange={(e) => setTestFile(validateXLSX(e.target.files[0]))}
                  required
                  className="hidden-file-input"
                />
              </div>
            </div>
            
            <div className="file-input-container">
              <label>DB File *</label>
              <div className="custom-file-input">
                <label htmlFor="dbFile" className="file-input-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span className="file-name">{dbFile ? dbFile.name : 'Choose file'}</span>
                </label>
                <input
                  id="dbFile"
                  type="file"
                  accept=".xlsx"
                  ref={dbFileRef}
                  onChange={(e) => setDbFile(validateXLSX(e.target.files[0]))}
                  required
                  className="hidden-file-input"
                />
              </div>
            </div>
            
            {showThirdFileInput && (
              <div className="file-input-container">
                <label>Covered Entity File *</label>
                <div className="custom-file-input">
                  <label htmlFor="coveredEntityFile" className="file-input-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <span className="file-name">{coveredEntityFile ? coveredEntityFile.name : 'Choose file'}</span>
                  </label>
                  <input
                    id="coveredEntityFile"
                    type="file"
                    accept=".xlsx"
                    ref={coveredEntityRef}
                    onChange={(e) => setCoveredEntityFile(validateXLSX(e.target.files[0]))}
                    required
                    className="hidden-file-input"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <br />
        <button disabled={!isSendEnabled()} onClick={handleSend}>
          {isLoading ? (
            <span>Processing Request...</span>
          ) : (
            <span>Send</span>
          )}
        </button>
        <div className="working-area">
          {isLoading && <div className="spinner"></div>}
          {uploadResult && (
            <p
              className={`upload-status${uploadResult === 'File upload failed!' ? ' shake' : ''}`}
              style={{
                color: isSuccess ? 'green' : 'red',
                fontWeight: 'bold',
              }}
            >
              {uploadResult}
            </p>
          )}
        </div>
        </div>
        
        <div className="tfb-file-viewer-container">
          <h3>File Viewer</h3>
          {downloadedFileName && (
            <div className="file-info">
              <p><strong>File:</strong> {downloadedFileName}</p>
              <button className="open-file-btn" onClick={handleOpenFile}>
                Open File in New Tab
              </button>
            </div>
          )}
          
          {downloadedFileContent && (
            <div className="file-content-display">
              <label>File Content Preview:</label>
              <textarea 
                className="file-content-textarea"
                value={downloadedFileContent}
                readOnly
                rows={15}
              />
            </div>
          )}
          
          {!downloadedFileContent && (
            <div className="no-file-message">
              <p>No file downloaded yet. Upload and process files to see content here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TFBValidator;