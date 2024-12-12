import React, {useEffect, useState} from "react";
import axios from "axios";
import request from "../../utils/Request";
import "./ResetPasswordForm.css";
import {API_BASE_URL, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import {AuthContext} from "./../../contexts/auth.contexts";
import {withRouter} from "react-router-dom";
import {useContext} from "react";
import Captcha from "demos-react-captcha";
import "./../../captcha.css";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import TextInput from "./../common/TextInput";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en:{
    neverShareEmail: "We'll never share your email with anyone else.",
    submit: "Submit",
    noAccount: "Don't have an account?",
    register: "Register",
    orLogin: "or login?",
    login: "Login",
    email: "Email",
    passwordResetSuccess: "Password reset successful and verification email has been sent.",
    invalidEmail: "Invalid email",
    required: "Required",
    tooLong: "Too Long!"
  },
  fi: {
    neverShareEmail: "Emme koskaan jaa sähköpostiosoitettasi kenenkään muun kanssa.",
    submit: "Lähetä",
    noAccount: "Eikö sinulla ole tiliä?",
    register: "Rekisteröidy",
    orLogin: "tai kirjaudu?",
    login: "Kirjaudu sisään",
    email: "Sähköposti",
    passwordResetSuccess: "Salasanan nollaus onnistui ja vahvistussähköposti on lähetetty.",
    invalidEmail: "Virheellinen sähköpostiosoite",
    required: "Vaadittu",
    tooLong: "Liian pitkä!"
  },
  sv: {
    neverShareEmail: "Vi delar aldrig din e-postadress med någon annan.",
    submit: "Skicka",
    noAccount: "Har du inget konto?",
    register: "Registrera",
    orLogin: "eller logga in?",
    login: "Logga in",
    email: "E-post",
    passwordResetSuccess: "Återställning av lösenord lyckades och en bekräftelse har skickats till din e-post.",
    invalidEmail: "Ogiltig e-postadress",
    required: "Obligatoriskt",
    tooLong: "För långt!"
}
});

var query = window.location.search.substring(1);
var urlParams = new URLSearchParams(query);
var localization = urlParams.get('lang');

if (localization == null) {
  strings.setLanguage(API_DEFAULT_LANGUAGE);
} else {
  strings.setLanguage(localization);
}

const ResetSchema = Yup.object().shape({
  email: Yup.string()
  .email(strings.invalidEmail)
  .required(strings.required)
  .max(64, strings.tooLong),
});

function ResetPasswordForm(props) {
  const [state, setState] = useState({
    email: "",
    successMessage: null,
  });
  
  const {authActions} = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [setting, setSetting] = React.useState({
    show_captcha: false
  });
  
  useEffect(()=>{
    request()
      .get("/api/settings")
      .then(res => {
        if(res.status == 200 ){
            const obj = {};
            for (let i = 0; i < res.data.data.length; i++) {
                const element = res.data.data[i];
                if(element.setting_value == "1"){
                    obj[element.setting_key] = true 
                }
                if(element.setting_value == "0"){
                    obj[element.setting_key] = false 
                }
            }
            setSetting(obj);
        }

      })
  },[])

  const handleChange = e => {
    const {id, value} = e.target;
    setState(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };
  
  const sendDetailsToServer = (values, formProps) => {
    request()
      .post(API_BASE_URL + "/api/users/forget-password", values)
      .then(function (response) {
        const json_string = JSON.stringify(response);
        const json_parsed = JSON.parse(json_string);
        if (json_parsed.data.success === true) {
          setState(prevState => ({
            ...prevState,
            successMessage:
              strings.passwordResetSuccess,
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
    props.updateTitle("Home");
    props.history.push("/home");
  };
  const redirectToRegister = () => {
    props.history.push("/register");
    props.updateTitle("Register");
  };
  const redirectToLogin = () => {
    props.history.push("/login");
    props.updateTitle("Login");
  };

  return (
    <>
    <div className="d-flex justify-content-center">
      <div className="animated-card">
        <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
          <div
            className="alert alert-success mt-2"
            style={{display: state.successMessage ? "block" : "none"}}
            role="alert"
          >
            {state.successMessage}
          </div>
          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={ResetSchema}
            onSubmit={(values, formProps) => {
                sendDetailsToServer(values, formProps);
            }}
          >
            {({values, errors, submitCount}) => {
              return (
                <Form className="Reset-form">
                  {!setting.disable_registertion_from_others && <div className="form-group text-left">
                    <TextInput
                      label={strings.email}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {strings.neverShareEmail}
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
                      {strings.neverShareEmail}
                    </small>
                  </div>
                  }
                  {setting.show_captcha && <div className="mt-2">
                    <Captcha onChange={status => setCaptchaSuccess(status)} />
                  </div>}
                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={setting.show_captcha?!captchaSuccess:false}
                  >
                    {strings.submit}
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div
            className="alert alert-success mt-2"
            style={{display: state.successMessage ? "block" : "none"}}
            role="alert"
          >
            {state.successMessage}
          </div>
          <div className="registerMessage">
            <span>{strings.noAccount} </span>
            <span className="loginText" onClick={() => redirectToRegister()}>
              {strings.register}
            </span>
        <span> {strings.orLogin} </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              {strings.login}
            </span>
          </div>
        </div>
        <div className="Reset-form-spacer"></div>
      </div>
    </div>
    <div className="Reset-form-spacer"></div>
    <div className="Reset-form-spacer"></div>
    </>
  );
}

export default withRouter(ResetPasswordForm);
