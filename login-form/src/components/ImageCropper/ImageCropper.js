import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import getCroppedImg, { getCroppedImgFile } from "./cropImage";
import "./ImageCropper.css";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    cropImage: "Crop Image"
  },
  fi: {
    cropImage: "Rajaa Kuva"
  },
  sv: {
    cropImage: "Beskär bild"
  }
});


function cropImageFunc(base64Image, crop) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, -crop.x, -crop.y);
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}


const ImageCropper = ({ showCropper,setShowCropper, imageSrc, onCropComplete, setCroppedImageFile }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const onCropChange = useCallback((cropTmp) => {
    setCrop(cropTmp);
  }, []);

  const onCropCompleteHandler = useCallback((croppedAreatmp, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
    onCropComplete(croppedAreatmp);
    console.log(crop);
    
  }, []);

  const onZoomChange = useCallback((zoomTmp) => {
    setZoom(zoomTmp);
  }, []);

  const cropImage = useCallback(async () => {
    try {
      const croppedImageTmp = await getCroppedImg(imageSrc, cropArea);
      const croppedImageTmpFile = await getCroppedImgFile(imageSrc, cropArea);
      setCroppedImage(croppedImageTmp);
      setCroppedImageFile(croppedImageTmpFile)
      setShowCropper(!showCropper)
    } catch (e) {
      console.error(e);
    }
  }, [cropArea, imageSrc]);

  return (<div>
        <div>
          {showCropper && (<div>
        {(
          <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={onZoomChange}
          />
          )}
          <br />
          {/* <button className="toggleImageButton btn btn-primary" onClick={() => setShowCropper(!showCropper)}>Toggle Cropper</button> */}
          <button className="cropImageButton btn btn-primary" onClick={cropImage}>{strings.cropImage}</button>
        </div>)}
        </div>
        {croppedImage && (
            <img className="max-height-profile-pic" src={croppedImage} alt="Cropped" onClick={()=>{
              setShowCropper(!showCropper)
              window.scrollTo({
                top: 0
              })
            }} />
        )}
    </div>
  );
};

export default ImageCropper;
