import React, { useState, useRef } from 'react';
import "./FileUploadForm.css";
import axios from "axios";
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { captureScreenshot } from '../../utils/screenshotCapture';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    uploadStlFile: "Upload STL File",
    browse: "Browse...",
    upload: "Upload",
    chose: "You chose file:",
    press: "Press Upload to upload it."
  },
  fi: {
    uploadStlFile: "Lataa STL-tiedosto",
    browse: "Selaa...",
    upload: "Lataa",
    chose: "Valitsit tiedoston:",
    press: "Paina Lataa ladataksesi sen."
  },
  sv: {
    uploadStlFile: "Ladda upp STL-fil",
    browse: "Bläddra...",
    upload: "Ladda upp",
    chose: "Du valde fil:",
    press: "Tryck på Ladda upp för att ladda upp den."
  }
});

const FileUploadForm = ({ newItemIsUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

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
      <strong className='FileFormUpload-title'>{strings.uploadStlFile}</strong>
      <br /><br />
      <div className="file-input-container">
        <input
          type="file"
          id="file-input"
          className="FileFormUplaod-file-selector"
          onChange={handleFileChange}
          accept=".stl"
          style={{display: 'none'}}
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
          {strings.browse}
        </button>
      </div>
      <button className="FileFormUplaod-file-button" onClick={handleFileUpload}>{strings.upload}</button>

      {selectedFile && (
        <div className="file-info">
          <p>{strings.chose} {selectedFile.name}. {strings.press}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
