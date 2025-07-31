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
  const [isSucces, setIsSuccess] = useState(false);

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
      // Get filename from Content-Disposition header if available
      let filename = 'NDCResults.txt';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '').trim();
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click(); 

    //reset file inputs
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

  return (
    <>
      <div>
        <label htmlFor="toolselection">Choose the tool:</label>
        <select id="toolselection" value={selected} onChange={handleChange}>
          <option value="none">-- Select --</option>
          <option value="tpavalidation">TPA Validation</option>
          <option value="npivalidation">NPI Validation</option>
          <option value="ndcandselfadminvalidation">NDC / SA Validation</option>
        </select>

        {selected && selected !== 'none' && (
          <div className="sendFiles">
            <label>Test File:</label>
            <input
              type="file"
              accept=".xlsx"
              ref={testFileRef}
              onChange={(e) => setTestFile(validateXLSX(e.target.files[0]))}
            />
            <label>DB File:</label>
            <input
              type="file"
              accept=".xlsx"
              ref={dbFileRef}
              onChange={(e) => setDbFile(validateXLSX(e.target.files[0]))}
            />
            {showThirdFileInput && (
              <>
                <label>Covered Entity File:</label>
                <input
                  type="file"
                  accept=".xlsx"
                  ref={coveredEntityRef}
                  onChange={(e) => setCoveredEntityFile(validateXLSX(e.target.files[0]))}
                />
              </>
            )}
          </div>
        )}

        <br />
        <button disabled={!isSendEnabled()} onClick={handleSend}>
          {isLoading ? 'Processing Request...' : 'Send'}
        </button>
        <div className="working-area">
            {isLoading && <div className="spinner"></div>}
            {uploadResult && <p className="upload-status" 
            style={{ color: isSucces ? 'green' : 'red', fontWeight: 'bold' }}
            >{uploadResult}</p>}
        </div>
      </div>
    </>
  );
}

export default TFBValidator;