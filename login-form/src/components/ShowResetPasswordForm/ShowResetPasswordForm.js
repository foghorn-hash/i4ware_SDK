import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ShowResetPasswordForm.css";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, APP_RECAPTCHA_SITE_KEY } from "../../constants/apiConstants";
import { AuthContext } from "./../../contexts/auth.contexts";
import { withRouter } from "react-router-dom";
import { Field, Form, Formik } from "formik";
import request from "../../utils/Request";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from 'react-google-recaptcha';
import { useTranslation } from "react-i18next";


const GetSignupSchema = (t) =>
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("Required")
      .max(64, "Too Long!"),
    password: Yup.string()
      .required("Required")
      .min(8, "Too Short!")
      .max(32, "Too Long!"),
    confirmPassword: Yup.string()
      .required("Required")
      .oneOf(
        [Yup.ref("password"), null],
        t('passwordsDontMatch')
      ),
  });

function ShowResetPasswordForm(props) {
  const [state, setState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    successMessage: null,
    recaptcha: "",
  });

  const [error, setError] = useState(null);
  const [agree, setAgree] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);       // tallennetaan reCAPTCHA:n token
    setCaptchaSuccess(!!value);   // true jos arvo on olemassa
  }

  const { authState, authActions } = React.useContext(AuthContext);
  const [setting, setSetting] = React.useState({
    show_captcha: false
  });

  function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair.shift());
      var value = decodeURIComponent(pair.join("="));
      // If first entry with this name
      if (typeof query_string[key] === "undefined") {
        query_string[key] = value;
        // If second entry with this name
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], value];
        query_string[key] = arr;
        // If third or later entry with this name
      } else {
        query_string[key].push(value);
      }
    }
    return query_string;
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
            if (element.setting_value === "1") {
              obj[element.setting_key] = true
            }
            if (element.setting_value === "0") {
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
    var url_string = props.location.search.substring(1);
    var url = parse_query_string(url_string);
    var token = url.token;
    //alert(token);
    request()
      .post(API_BASE_URL + "/api/users/reset-password?token=" + token, {
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
              t('passwordResetSuccessful'),
          }));
          setError(null);
        } else {
          console.log(json_parsed.data);
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
    <div className="reset d-flex justify-content-center">
      <div className="card col-12 col-lg-4 reset-card mt-2 hv-center">
        <div
          className="alert alert-success mt-2"
          style={{ display: state.successMessage ? "block" : "none" }}
          role="alert"
        >
          {state.successMessage}
        </div>
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: ""
          }}
          validationSchema={GetSignupSchema(t)}
          onSubmit={(values, formProps) => {
            sendDetailsToServer(values, formProps);
          }}
        >
          {({ values, errors, submitCount }) => {
            return (
              <Form className="Reset-form">
                <div className="form-group text-left">
                  <TextInput
                    label={t('email')}
                    placeholder="john.doe@domain.com"
                    name="email"
                  />
                  <small id="emailHelp" className="form-text text-muted">
                    {t('neverShareEmail')}
                  </small>
                </div>
                <div className="form-group text-left">
                  <label htmlFor="validationCustom03" className={"form-label"}>
                    {t('password')}
                  </label>
                  <PassWordInput
                    label={t('password')}
                    placeholder=""
                    name="password"
                    type="password"
                  />
                  <small id="emailHelp" className="form-text text-muted">
                    {t('passwordStronglyCrypted')}
                  </small>
                </div>
                <div className="form-group text-left">
                  <label htmlFor="validationCustom03" className={"form-label"}>
                    {t('confirmPassword')}
                  </label>
                  <PassWordInput
                    label={t('confirmPassword')}
                    placeholder=""
                    name="confirmPassword"
                    type="password"
                  />
                  <small id="emailHelp" className="form-text text-muted">
                    {t('passwordStronglyCrypted')}
                  </small>
                </div>
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
          <span>Dont have an account? </span>
          <span className="loginText" onClick={() => redirectToRegister()}>
            {t('register')}
          </span>
          <span> {t('orLogin')} </span>
          <span className="loginText" onClick={() => redirectToLogin()}>
            {t('login')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default withRouter(ShowResetPasswordForm);
