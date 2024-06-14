import React, { useState, useCallback, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import Cropper from "./../ImageCropper/ImageCropper";
import { getCroppedImg } from "./../ImageCropper/cropImage";
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import request from "../../utils/Request";
import TextInput from "./../common/TextInput";
import { AuthContext } from "../../contexts/auth.contexts";
import "./MyProfile.css";
import LOADING from "../../tube-spinner.svg";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import ImageCropper from "./../ImageCropper/ImageCropper";
import WebcamCapture from "../../components/WebcamCapture/WebcamCapture";
import Webcam from 'react-webcam';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    myDetails: "My Details",
    uploadImage: "Upload Image",
    removeImage: "Remove Image",
    cropImage: "Crop Image",
    capturePhoto: "Capture Photo",
    fullname: "Fullname",
    gender: "Gender",
    male: "Male",
    female: "Female",
    save: "Save",
    saving: "Saving...",
    nameRequired: "Name is required",
    genderRequired: "Gender is required",
    loading: "Loading...",
  },
  fi: {
    myDetails: "Omat tiedot",
    uploadImage: "Lataa kuva",
    removeImage: "Poista kuva",
    cropImage: "Rajaa kuva",
    capturePhoto: "Ota valokuva",
    fullname: "Koko nimi",
    gender: "Sukupuoli",
    male: "Mies",
    female: "Nainen",
    save: "Tallenna",
    saving: "Tallennetaan...",
    nameRequired: "Nimi vaaditaan",
    genderRequired: "Sukupuoli vaaditaan",
    loading: "Ladataan...",
  },
  se: {
    myDetails: "Mina uppgifter",
    uploadImage: "Ladda upp bild",
    removeImage: "Ta bort bild",
    cropImage: "Beskär bild",
    capturePhoto: "Ta foto",
    fullname: "Fullständigt namn",
    gender: "Kön",
    male: "Man",
    female: "Kvinna",
    save: "Spara",
    saving: "Sparar...",
    nameRequired: "Namn är obligatoriskt",
    genderRequired: "Kön är obligatoriskt",
    loading: "Laddar...",
  }
});

function MyProfile(props) {
  const [data, setData] = useState(null);
  const { authState, authActions } = React.useContext(AuthContext);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedImageFile, setCroppedImageFile] = useState('a');
  const [imageSrc, setImageSrc] = useState(null);
  const profileRef = useRef();
  const [showCropper, setShowCropper] = useState(false);
  const [showMessage, setShowMessage] = useState(null);
  const webcamRef = useRef(null);
  // State for controlling webcam overlay visibility
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const onCropChange = useCallback((cropTemp) => {
    setCrop(cropTemp);
  }, []);

  const onFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(event.target.files[0]);
      fileReader.onload = () => {
        setImageSrc(fileReader.result);
        setShowCropper(true);
      };
    }
  };

  const onCropComplete = useCallback((croppedArea) => {
    if(croppedArea){
      console.log(croppedArea);
      setCroppedArea(croppedArea);
    }
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  useEffect(() => {
    request()
      .get(API_BASE_URL + "/api/users/userdata", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      })
      .then((res) => {
        setData(res.data);
      });
  }, []);

  
  const SignupSchema = Yup.object().shape({
    name: Yup.string().required(strings.nameRequired),
    gender: Yup.string().required(strings.genderRequired),
  });

  const handleSubmit = async (values, formProps) => {
    const formData = new FormData();
    if(croppedImageFile){
      formData.append('file', croppedImageFile );
    }
    formData.append('fullname', values.name);
    formData.append('gender', values.gender);
    formProps.setSubmitting(true);

    request()
      .post(API_BASE_URL + "/api/manage/myprofile", formData)
      .then((res) => {
        console.log(formProps);
        // setIsSubmitting(false);
        debugger
        formProps.setSubmitting(false)
        if(res.status === 200){
          if(res.data.success === true ){
            setData(res.data.user);
            setShowMessage(res.data.message)
            setTimeout(()=>{
              setShowMessage(null)
            },2500)
          }
        }
      }).catch((err)=>{
        console.log('aa');
        debugger
      });
  }

  const loadUserData = async (e) => {
    request()
    .get(API_BASE_URL + "/api/users/userdata", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
      },
    })
    .then((res) => {
      setData(res.data);
    });
  }

  function CustomTextInput(props) {
    const [field, meta] = useField(props);
    return (
      <div>
        <label htmlFor={props.name}>{props.label}</label>
        <input {...field} {...props} />
        {meta.touched && meta.error ? (
          <div className="error">{meta.error}</div>
        ) : null}
      </div>
    );
  }

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  };

  // Function to open the webcam overlay
  const openWebcam = () => {
    setIsWebcamOpen(true);
  };

  // Function to close the webcam overlay
  const closeWebcam = () => {
    setIsWebcamOpen(false);
  };
  
  if (!data) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  var defaultImage;

  if (data.gender=="male") {
    defaultImage = DefaultMaleImage;
  } else {
    defaultImage = DefaultFemaleImage;
  }

  return (
    <div className="mt-2">
        {showMessage && <div className="alert alert-success" >{showMessage}</div>}
        <h3 className="my-2">{strings.myDetails}</h3>
        {!imageSrc && <img className="max-height-profile-pic" src={data.profile_picture_path?(API_BASE_URL + data.profile_picture_path):defaultImage} />}
        <br />
        {imageSrc && (
            <ImageCropper
              imageSrc={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              showCropper={showCropper}
              setShowCropper={setShowCropper}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              setCroppedImageFile={setCroppedImageFile}
              cropShape="round"
            />
        )}
        {!imageSrc && <button className="btn btn-info " onClick={()=>{
          profileRef.current.click();
        }} > {strings.uploadImage} </button>}
        {imageSrc && <button className="btn btn-danger " onClick={()=>{
          setImageSrc(null)
        }} > {strings.removeImage} </button>}
        {imageSrc && <button className="btn btn-info mx-2 " onClick={()=>{
          setShowCropper(true)
        }} > {strings.cropImage} </button>}
      <input className="btn btn-primary" style={{display: "none"}} type="file" ref={profileRef} onChange={onFileChange} />
      <br />
      <br />
      {isWebcamOpen && (
      <WebcamCapture 
          onClose={closeWebcam} // Pass the closeWebcam function to handle closing the webcam overlay
          onCapture={capture} // Pass the capture function if needed
          loadUserData={loadUserData}
      />
      )}
      <button className="btn btn-primary" onClick={openWebcam}>{strings.capturePhoto}</button>
      <br />
      <br />
      <div className="userForm">
        <Formik
          initialValues={{
            name: data.name,
            gender: data.gender,
          }}
          validationSchema={SignupSchema}
          onSubmit={(values, formProps) => {
            handleSubmit(values, formProps);
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className="row g-3">
              <div className="col-12">
                <CustomTextInput
                  label={strings.fullname}
                  name="name"
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="col-12">
                <label for="gender" className="select-gender-label-myprofile">
                  {strings.gender}
                </label>
                <br />
                <Field className="select-gender-myprofile" as="select" name="gender">
                  <option value="male">{strings.male}</option>
                  <option value="female">{strings.female}</option>
                </Field>
              </div>
              <br />
              <div className="col-12">
                <button
                  type="button"
                  onClick={submitForm}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ marginBottom: "40px" }}
                >
                  {isSubmitting === true ? strings.saving : strings.save}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default withRouter(MyProfile);

