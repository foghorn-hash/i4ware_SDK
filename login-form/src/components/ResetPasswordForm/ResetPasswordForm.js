import React, { useEffect, useState } from "react";
import request from "../../utils/Request";
import "./ResetPasswordForm.css";
import { API_BASE_URL, APP_RECAPTCHA_SITE_KEY } from "../../constants/apiConstants";
import { AuthContext } from "./../../contexts/auth.contexts";
import { withRouter } from "react-router-dom";
import { useContext } from "react";
import Captcha from 'react-google-recaptcha';
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import TextInput from "./../common/TextInput";
import { useTranslation } from "react-i18next";



const GetResetSchema = (t) =>
  Yup.object().shape({
    email: Yup.string()
      .email(t('invalidEmail'))
      .required(t('required'))
      .max(64, t('tooLong')),
  });

function ResetPasswordForm(props) {
  const [state, setState] = useState({
    email: "",
    recaptcha: "",
    successMessage: null,
  });

  const { authActions } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [setting, setSetting] = React.useState({
    show_captcha: false
  });

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);       // tallennetaan reCAPTCHA:n token
    setCaptchaSuccess(!!value);   // true jos arvo on olemassa
  }


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  useEffect(() => {
    request()
      .get("/api/settings")
      .then(res => {
        if (res.status == 200) {
          const obj = {};
          for (let i = 0; i < res.data.data.length; i++) {
            const element = res.data.data[i];
            if (element.setting_value == "1") {
              obj[element.setting_key] = true
            }
            if (element.setting_value == "0") {
              obj[element.setting_key] = false
            }
          }
          setSetting(obj);
        }

      })
  }, [])

  const handleChange = e => {
    const { id, value } = e.target;
    setState(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const sendDetailsToServer = (values, formProps) => {
    request()
      .post(API_BASE_URL + "/api/users/forget-password", {
        recaptcha: captchaValue,
        ...values
      }, values)
      .then(function (response) {
        const json_string = JSON.stringify(response);
        const json_parsed = JSON.parse(json_string);
        if (json_parsed.data.success === true) {
          setState(prevState => ({
            ...prevState,
            successMessage:
              t('passwordResetSuccess'),
          }));
          setError(null);
        } else {
          console.log(json_parsed.data);
          setError(json_parsed.data.data);
          for (const key in json_parsed.data.data) {
            if (Object.hasOwnProperty.call(json_parsed.data.data, key)) {
              const element = json_parsed.data.data[key];
              formProps.setFieldError(key, element[0]);
            }
          }
        }
      })
      .catch(function (error) {
        console.log(error);
        setError(error);
      });
  };

  const redirectToHome = () => {
    props.history.push("/home");
  };
  const redirectToRegister = () => {
    props.history.push("/register");
  };
  const redirectToLogin = () => {
    props.history.push("/login");
  };

  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
          <div
            className="alert alert-success mt-2"
            style={{ display: state.successMessage ? "block" : "none" }}
            role="alert"
          >
            {state.successMessage}
          </div>
          <Formik
            initialValues={{
              email: ""
            }}
            validationSchema={GetResetSchema(t)}
            onSubmit={(values, formProps) => {
              sendDetailsToServer(values, formProps);
            }}
          >
            {({ values, errors, submitCount }) => {
              return (
                <Form className="Reset-form">
                  {!setting.disable_registertion_from_others && <div className="form-group text-left">
                    <TextInput
                      label={t('email')}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {t('neverShareEmail')}
                    </small>
                  </div>
                  }
                  {setting.disable_registertion_from_others && <div className="form-group text-left">
                    <TextInput
                      label={"Email"}
                      placeholder="john.doe@i4ware.fi"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {t('neverShareEmail')}
                    </small>
                  </div>
                  }
                  {setting.show_captcha && <div className="mt-2">
                    <Captcha sitekey={APP_RECAPTCHA_SITE_KEY} onChange={handleCaptchaChange} />
                  </div>}
                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={setting.show_captcha ? !captchaSuccess : false}
                  >
                    {t('submit')}
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div
            className="alert alert-success mt-2"
            style={{ display: state.successMessage ? "block" : "none" }}
            role="alert"
          >
            {state.successMessage}
          </div>
          <div className="registerMessage">
            <span>{t('noAccount')}</span>
            <span className="loginText" onClick={() => redirectToRegister()}>
              {t('register')}
            </span>
            <span> {t('orLogin')} </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              {t('login')}
            </span>
          </div>
        </div>
        <div className="Reset-form-spacer"></div>
      </div>
      <div className="Reset-form-spacer"></div>
      <div className="Reset-form-spacer"></div>
    </>
  );
}

export default withRouter(ResetPasswordForm);
