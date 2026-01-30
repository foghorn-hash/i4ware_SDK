import React, {useEffect, useState} from "react";
import axios from "axios";
import "./ShowResetPasswordForm.css";
import {API_BASE_URL, API_DEFAULT_LANGUAGE, APP_RECAPTCHA_SITE_KEY} from "../../constants/apiConstants";
import {AuthContext} from "./../../contexts/auth.contexts";
import {withRouter} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import request from "../../utils/Request";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from 'react-google-recaptcha';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    invalidEmail: "Invalid email",
    required: "Required",
    tooLong: "Too Long!",
    tooShort: "Too Short!",
    passwordsDontMatch: "Password and Confirm password should be same.",
    passwordResetSuccessful: "Password reset successful.",
    neverShareEmail: "We'll never share your email with anyone else.",
    passwordStronglyEncrypted: "Password is strongly encrypted and is secure in our database.",
    submit: "Submit",
    noAccount: "Don't have an account?",
    register: "Register",
    orLogin: "or login?",
    login: "Login",
    newershare:"We'll never share your email with anyone else.",
    email:"Email",
    password:"Password",
    confirmPassword:"Confirm Password",
  },
  fi: {
    invalidEmail: "Virheellinen sähköpostiosoite",
    required: "Vaadittu",
    tooLong: "Liian pitkä!",
    tooShort: "Liian lyhyt!",
    passwordsDontMatch: "Salasanan ja vahvistetun salasanan tulee olla sama.",
    passwordResetSuccessful: "Salasanan nollaus onnistui.",
    neverShareEmail: "Emme koskaan jaa sähköpostiosoitettasi kenenkään muun kanssa.",
    passwordStronglyEncrypted: "Salasana on vahvasti salattu ja turvallinen tietokannassamme.",
    submit: "Lähetä",
    noAccount: "Eikö sinulla ole tiliä?",
    register: "Rekisteröidy",
    orLogin: "tai kirjaudu?",
    login: "Kirjaudu sisään",
    newershare: "Emme koskaan jaa sähköpostiasi kenellekään.",
    email: "Sähköposti",
    password: "Salasana",
    confirmPassword: "Vahvista salasana",
  },
  sv: {
    invalidEmail: "Ogiltig e-postadress",
    required: "Obligatoriskt",
    tooLong: "För långt!",
    tooShort: "För kort!",
    passwordsDontMatch: "Lösenord och bekräftelse lösenord måste vara samma.",
    passwordResetSuccessful: "Återställning av lösenord lyckades.",
    neverShareEmail: "Vi delar aldrig din e-postadress med någon annan.",
    passwordStronglyEncrypted: "Ditt lösenord är starkt krypterat och säkert i vår databas.",
    submit: "Skicka",
    noAccount: "Har du inget konto?",
    register: "Registrera",
    orLogin: "eller logga in?",
    login: "Logga in",
    newershare: "Vi delar aldrig din e-post med någon annan.",
    email: "E-post",
    password: "Lösenord",
    confirmPassword: "Bekräfta lösenord",
  }
});

const SignupSchema = Yup.object().shape({
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
      strings.passwordsDontMatch
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

   var query = window.location.search.substring(1);
    var urlParams = new URLSearchParams(query);
    var localization = urlParams.get('lang');
  
    if (localization == null) {
      strings.setLanguage(API_DEFAULT_LANGUAGE);
    } else {
      strings.setLanguage(localization);
    }

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);       // tallennetaan reCAPTCHA:n token
    setCaptchaSuccess(!!value);   // true jos arvo on olemassa
  }

  const {authState, authActions} = React.useContext(AuthContext);
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
  
  useEffect(()=>{
    request()
      .get("/api/settings")
      .then(res => {
        if(res.status == 200 ){
            const obj = {};
            for (let i = 0; i < res.data.data.length; i++) {
                const element = res.data.data[i];
                if(element.setting_value === "1"){
                    obj[element.setting_key] = true 
                }
                if(element.setting_value === "0"){
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
  var url_string = props.location.search.substring(1);
	var url = parse_query_string(url_string);
	var token = url.token;
  //alert(token);
    request()
      .post(API_BASE_URL + "/api/users/reset-password?token="+token, {
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
              strings.passwordResetSuccessful,
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
            style={{display: state.successMessage ? "block" : "none"}}
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
            validationSchema={SignupSchema}
            onSubmit={(values, formProps) => {
                sendDetailsToServer(values, formProps);
            }}
          >
          {({values, errors, submitCount}) => {
              return ( 
          <Form className="Reset-form">
            <div className="form-group text-left">
              <TextInput
                      label={strings.email}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
              <small id="emailHelp" className="form-text text-muted">
                {strings.neverShareEmail}
              </small>
            </div>
        <div className="form-group text-left">
                    <label htmlFor="validationCustom03" className={"form-label"}>
                      {strings.password}
                    </label>
                    <PassWordInput
                      label={strings.password}
                      placeholder=""
                      name="password"
                      type="password"
                    />
            <small id="emailHelp" className="form-text text-muted">
               {strings.passwordStronglyCrypted}
            </small>
                  </div>
                  <div className="form-group text-left">
                    <label htmlFor="validationCustom03" className={"form-label"}>
                      {strings.confirmPassword}
                    </label>
                    <PassWordInput
                      label={strings.confirmPassword}
                      placeholder=""
                      name="confirmPassword"
                      type="password"
                    />
            <small id="emailHelp" className="form-text text-muted">
                {strings.passwordStronglyCrypted}
            </small>
                  </div>
                  {setting.show_captcha && <div className="mt-2">
                    <Captcha sitekey={APP_RECAPTCHA_SITE_KEY} onChange={handleCaptchaChange} />
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
            <span>Dont have an account? </span>
            <span className="loginText" onClick={() => redirectToRegister()}>
              {strings.register}
            </span>
        <span> {strings.orLogin} </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              {strings.login}
            </span>
          </div>
        </div>
    </div>
  );
}

export default withRouter(ShowResetPasswordForm);
