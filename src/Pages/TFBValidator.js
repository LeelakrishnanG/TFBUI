import React, { useState, useRef } from 'react';
import '../CSS/tfbvalidatorCSS.css';
import axios from 'axios';

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
    if (selected === 'none' || selected === '') return false;
    if (!testFile || !dbFile) return false;
    if (showThirdFileInput && !coveredEntityFile) return false;
    return true;
  };

  const handleSend = async () => {
    if (!isSendEnabled()) return;

    const formData = new FormData();
    formData.append('testFile', testFile);
    formData.append('dbFile', dbFile);
    if (showThirdFileInput && coveredEntityFile) {
      formData.append('coveredEntityFile', coveredEntityFile);
    }

    const endpointMap = {
      tpavalidation: 'http://localhost:8080/api/tpa/TPAvalidation',
      npivalidation: 'http://localhost:8080/api/npi/NPIvalidation',
      ndcandselfadminvalidation: 'http://localhost:8080/api/ndc/NDCvalidation',
    };

    const endpoint = endpointMap[selected];

    try {
      setIsLoading(true);
      setUploadResult('');
      const response = await axios.post(endpoint, formData, {
        responseType: 'blob'
      });
      setIsSuccess(true);
      setUploadResult('File sent successfully!');
      console.log('Response:', response.data);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;

      let filename = 'NDCResults.txt';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Also store the file content for display in the parallel container
      const reader = new FileReader();
      reader.onload = function(e) {
        setDownloadedFileContent(e.target.result);
        setDownloadedFileName(filename);
      };
      reader.readAsText(response.data); 

      if (testFileRef.current) testFileRef.current.value = '';
      if (dbFileRef.current) dbFileRef.current.value = '';
      if (coveredEntityRef.current) coveredEntityRef.current.value = '';
      setTestFile(null);
      setDbFile(null);  
      setCoveredEntityFile(null);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadResult('File upload failed!');
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
          <option value="none" disabled>-- Select --</option>
          <option value="tpavalidation">TPA Validation</option>
          <option value="npivalidation">NPI Validation</option>
          <option value="ndcandselfadminvalidation">NDC / SA Validation</option>
        </select>

        {selected && selected !== 'none' && (
          <div className="sendFiles">
            <label>Test File *</label>
            <input
              type="file"
              accept=".xlsx"
              ref={testFileRef}
              onChange={(e) => setTestFile(validateXLSX(e.target.files[0]))}
              required
            />
            <label>DB File *</label>
            <input
              type="file"
              accept=".xlsx"
              ref={dbFileRef}
              onChange={(e) => setDbFile(validateXLSX(e.target.files[0]))}
              required
            />
            {showThirdFileInput && (
              <>
                <label>Covered Entity File *</label>
                <input
                  type="file"
                  accept=".xlsx"
                  ref={coveredEntityRef}
                  onChange={(e) => setCoveredEntityFile(validateXLSX(e.target.files[0]))}
                  required
                />
              </>
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