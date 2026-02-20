import React, { useState, useCallback, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { Formik, Field, Form, useField } from "formik";
import * as Yup from "yup";
import {
  API_BASE_URL,
  ACCESS_TOKEN_NAME,
} from "../../constants/apiConstants";
import request from "../../utils/Request";
import { AuthContext } from "../../contexts/auth.contexts";
import "./MyProfile.css";
import LOADING from "../../tube-spinner.svg";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import ImageCropper from "./../ImageCropper/ImageCropper";
import WebcamCapture from "../../components/WebcamCapture/WebcamCapture";
import { useTranslation } from "react-i18next";

function MyProfile(props) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const { authState, authActions } = React.useContext(AuthContext);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [croppedImageFile, setCroppedImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const profileRef = useRef();
  const [showCropper, setShowCropper] = useState(false);
  const [showMessage, setShowMessage] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  // Sync Language from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  // Robust Data Fetching
  const loadUserData = useCallback(() => {
    request()
      .get(API_BASE_URL + "/api/users/userdata", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      })
      .then((res) => {
        // Defensive check: handle if utility returns res or res.data
        const responseData = res?.data?.data || res?.data || res;
        if (responseData && typeof responseData === 'object') {
          setData(responseData);
        } else {
          console.error("Data undefined in response", res);
          setData({}); // Break loading loop
        }
      })
      .catch((err) => {
        console.error("Load error", err);
        setData({}); // Break loading loop
      });
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const SignupSchema = Yup.object().shape({
    name: Yup.string().required(t('nameRequired')),
    gender: Yup.string().required(t('genderRequired')),
  });

  const handleSubmit = async (values, formProps) => {
    const formData = new FormData();
    if (croppedImageFile && typeof croppedImageFile !== 'string') {
      formData.append("file", croppedImageFile);
    }
    formData.append("fullname", values.name);
    formData.append("gender", values.gender);
    formProps.setSubmitting(true);

    request()
      .post(API_BASE_URL + "/api/manage/myprofile", formData)
      .then((res) => {
        formProps.setSubmitting(false);
        const updatedUser = res?.data?.user || res?.data || res;
        if (updatedUser) {
          setData(updatedUser);
          setShowMessage(t('saved'));
          setTimeout(() => setShowMessage(null), 2500);
          setImageSrc(null); // Clear cropper after successful save
        }
      })
      .catch((err) => {
        formProps.setSubmitting(false);
        console.error("Submit error", err);
      });
  };

  function CustomTextInput(props) {
    const [field, meta] = useField(props);
    return (
      <div>
        <label htmlFor={props.name}>{props.label}</label>
        <input {...field} {...props} />
        {meta.touched && meta.error ? (
          <div className="error text-danger">{meta.error}</div>
        ) : null}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  // IMAGE RENDER LOGIC (Copied from ManageAdmin)
  const profilePicUrl = data.profile_picture_path
    ? API_BASE_URL +
      data.profile_picture_path.replaceAll(
        "public/uploads",
        "/storage/uploads"
      )
    : null;

  const defaultImg = data.gender === "female" ? DefaultFemaleImage : DefaultMaleImage;

  return (
    <div className="mt-2 container-fluid">
      {showMessage && <div className="alert alert-success">{showMessage}</div>}
      <h3 className="my-2">{t('myDetails')}</h3>
      
      <div className="profile-image-container">
        {!imageSrc && (
          <img
            className="max-height-profile-pic"
            alt="Profile"
            src={profilePicUrl || defaultImg}
            onError={(e) => { e.target.src = defaultImg; }}
          />
        )}

        {imageSrc && (
          <ImageCropper
            imageSrc={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            showCropper={showCropper}
            setShowCropper={setShowCropper}
            onCropChange={setCrop}
            onCropComplete={(area) => setCroppedArea(area)}
            onZoomChange={setZoom}
            setCroppedImageFile={setCroppedImageFile}
            cropShape="round"
          />
        )}
      </div>

      <div className="mt-3">
        {!imageSrc ? (
          <button
            className="btn btn-info me-2"
            onClick={() => profileRef.current.click()}
          >
            {t('uploadImage')}
          </button>
        ) : (
          <>
            <button
              className="btn btn-danger me-2"
              onClick={() => {
                setImageSrc(null);
                setCroppedImageFile(null);
              }}
            >
              {t('removeImage')}
            </button>
            <button
              className="btn btn-info me-2"
              onClick={() => setShowCropper(true)}
            >
              {t('cropImage')}
            </button>
          </>
        )}

        <button className="btn btn-primary" onClick={() => setIsWebcamOpen(true)}>
          {t('capturePhoto')}
        </button>
      </div>

      <input
        type="file"
        ref={profileRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () => {
              setImageSrc(reader.result);
              setShowCropper(true);
            };
          }
        }}
      />

      {isWebcamOpen && (
        <WebcamCapture
          onClose={() => setIsWebcamOpen(false)}
          onCapture={(img) => {
            setImageSrc(img);
            setIsWebcamOpen(false);
            setShowCropper(true);
          }}
          loadUserData={loadUserData}
        />
      )}

      <div className="userForm mt-4">
        <Formik
          initialValues={{
            name: data.fullname || data.name || "",
            gender: data.gender || "male",
          }}
          enableReinitialize={true}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="row g-3">
              <div className="col-12">
                <CustomTextInput
                  label={t('fullname')}
                  name="name"
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="col-12">
                <label className="form-label">{t('gender')}</label>
                <br />
                <Field
                  className="form-select select-gender-myprofile"
                  as="select"
                  name="gender"
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </Field>
              </div>
              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting}
                  style={{ marginBottom: "40px" }}
                >
                  {isSubmitting ? t('saving') : t('save')}
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