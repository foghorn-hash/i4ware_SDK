import React, { useState, useCallback, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import Axios from "axios";
import Cropper from "./../ImageCropper/ImageCropper";
import { getCroppedImg } from "./../ImageCropper/cropImage";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import request from "../../utils/Request";
import TextInput from "./../common/TextInput";
import { AuthContext } from "../../contexts/auth.contexts";
import "./MyProfile.css";
import LOADING from "../../1487-loading.gif";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import ImageCropper from "./../ImageCropper/ImageCropper";
import WebcamCapture from "../../components/WebcamCapture/WebcamCapture";
import Webcam from 'react-webcam';

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
    name: Yup.string().required("Name is required"),
    gender: Yup.string().required("Gender is required"),
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
        <h3 className="my-2">My Details</h3>
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
        }} > Upload Image </button>}
        {imageSrc && <button className="btn btn-danger " onClick={()=>{
          setImageSrc(null)
        }} > Remove Image </button>}
        {imageSrc && <button className="btn btn-info mx-2 " onClick={()=>{
          setShowCropper(true)
        }} > Crop Image </button>}
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
      <button className="btn btn-primary" onClick={openWebcam}>Capture Photo</button>
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
                  label="Fullname"
                  name="name"
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="col-12">
                <label for="gender" className="select-gender-label-myprofile">
                  Gender
                </label>
                <br />
                <Field className="select-gender-myprofile" as="select" name="gender">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Field>
              </div>
              <br />
              <div className="col-12">
                <button
                  type="button"
                  onClick={submitForm}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting === true ? "Saving..." : "Save"}
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

