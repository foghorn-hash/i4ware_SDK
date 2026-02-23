import React, { useState, useRef, useEffect } from 'react';
import "./FileUploadForm.css";
import axios from "axios";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { captureScreenshot } from '../../utils/screenshotCapture';
import { useTranslation } from 'react-i18next';


const FileUploadForm = ({ newItemIsUploaded }) => {
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Save to multiple places to survive re-renders
      setSelectedFile(file);
      fileRef.current = file;
      window.tempUploadFile = file;
    }
  };

  const handleFileUpload = async () => {
    const fileToUpload = selectedFile || fileRef.current || window.tempUploadFile;

    if (fileToUpload) {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      try {
        const screenshotDataUrl = await captureScreenshot(fileToUpload);
        formData.append('screenshot', screenshotDataUrl);

        const response = await axios.post(API_BASE_URL + '/api/stl/upload-stl', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        });

        if (response.data && response.data.fileName) {
          newItemIsUploaded(response.data.fileName);
          setSelectedFile(null);
          fileRef.current = null;
          window.tempUploadFile = null;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Upload failed: ' + error.message);
      }
    } else {
      alert('Please select a file first');
    }
  };

  return (
    <div>
      <strong className='FileFormUpload-title'>{t('uploadStlFile')}</strong>
      <br /><br />
      <div className="file-input-container">
        <input
          type="file"
          id="file-input"
          className="FileFormUplaod-file-selector"
          onChange={handleFileChange}
          accept=".stl"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => document.getElementById('file-input').click()}
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            padding: '10px 15px',
            marginRight: '10px',
            marginLeft: '10px',
            border: '1px red solid',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'red'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          {t('browse')}
        </button>
      </div>
      <button className="FileFormUplaod-file-button" onClick={handleFileUpload}>{t('upload')}</button>

      {selectedFile && (
        <div className="file-info">
          <p>{t('chose')} {selectedFile.name}. {t('press')}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
