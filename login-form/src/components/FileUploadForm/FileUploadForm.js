import React, { useState } from 'react';
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

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const screenshotDataUrl = await captureScreenshot(selectedFile);
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
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
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
        />
        <label htmlFor="file-input">{strings.browse}</label>
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
