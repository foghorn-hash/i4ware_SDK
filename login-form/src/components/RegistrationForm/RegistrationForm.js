import React, {useEffect, useState} from "react";
import "./RegistrationForm.css";
import {API_BASE_URL, API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import {Redirect, withRouter} from "react-router-dom";
import {AuthContext} from "./../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from "demos-react-captcha";
import "./../../captcha.css";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en:{
    email:"Email address",
    enteremail:"Enter email",
    newershare:"We'll never share your email with anyone else.",
    password:"Password",
    male:"Male",
    female:"Female",
    account:"Already have an account?",
    register:"Register",
    confirmPassword:"Confirm Password",
    domain:"Domain",
    error:"Unexpected error!",
    gender:"Gender",
    name:"Name",
    success_registeration:"Registration successful and verification email has been sent.",
  },
  fi: {
    email:"Sähköpostiosoite",
    enteremail:"Syötä sähköpostiosoite",
    newershare:"Enme koskaan jaa sähköpostiosoitettasi muille.",
    password:"Salasana",
    male:"Mies",
    female:"Nainen",
    account:"Minulla on jo tili?",
    register:"Rekisteröidy",
    confirmPassword:"Vahvista salasana",
    domain:"Verkkotunnus",
    error:"Odottamaton virhe!",
    gender:"Sukupuoli",
    name:"Nimi",
    success_in_registeration:"Rekisteräinti onnistui ja vahvistus sähköposti on lähetetty.",
  }
 });

const SignupSchema = Yup.object().shape({
    name: Yup.string().required("Required").max(32, "Too Long!"),
    gender: Yup.string().required("Required").max(6, "Too Long!"),
    email: Yup.string()
      .email("Invalid email")
      .required("Required")
      .max(64, "Too Long!"),
    domain: Yup.string()
      .matches(/([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+/, "Domain is invalid")
      .required("Required"),
    password: Yup.string()
      .required("Required")
      .min(8, "Too Short!")
      .max(32, "Too Long!"),
    confirmPassword: Yup.string()
      .required("Required")
      .oneOf(
        [Yup.ref("password"), null],
        "Password and Confirm password should be same."
      ),
});

function RegistrationForm(props) {
  const [state, setState] = useState({
    name: "",
    email: "",
    domain: "",
    password: "",
    confirmPassword: "",
    successMessage: null,
    gender: "male"
  });
  
  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization==null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const [error, setError] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);

  const {authState, authActions} = React.useContext(AuthContext);
  const [setting, setSetting] = React.useState({
    show_captcha: false,
    disable_registeration_from_others: false
  });

  useEffect(()=>{
    // setLoading(true);
    request()
      .get("/api/settings")
      .then(res => {
        if(res.status == 200 ){
          // setLoading(false);
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

  const sendDetailsToServer = (values, formProps) => {
    setLoading(true);
    request()
      .post(API_BASE_URL + "/api/users/register", values)
      .then(function (response) {
        const json_parsed = response.data
        debugger
        if (json_parsed.success === true) {
          setState(prevState => ({
            ...prevState,
            successMessage:
              strings.success_in_registeration,
          }));
          setError(null);

          setLoading(false);
          setTimeout(()=>{
            redirectToLogin();
          },5000)
        } else {
          setLoading(false);
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
        setLoading(false);
        console.log(error);
      });
  };
  const redirectToLogin = () => {
    props.updateTitle("Login");
    props.history.push("/login");
  };

  if (authState.isLogged) {
    return <Redirect to={"/home"}></Redirect>;
  }

  return (
    <div className={"registeration d-flex justify-content-center " }>
        {loading && <div className={"loading-view"} ></div>}
      <div className="animated-card">
        <div className="card col-12 col-lg-6 register-card mt-2">
          <div
            className="alert alert-success mt-2"
            style={{display: state.successMessage ? "block" : "none"}}
            role="alert"
          >
            {state.successMessage}
          </div>
          <Formik
            initialValues={{
              name: "",
              email: "",
              domain: "",
              password: "",
              confirmPassword: "",
              gender: "male",
            }}
            validationSchema={SignupSchema}
            onSubmit={(values, formProps) => {
              if(agree == true){
                sendDetailsToServer(values, formProps);
              }
            }}
          >
            {({values, errors, submitCount}) => {
              return (
                <Form className="Register-form"> 
                  {
                    submitCount > 0 && agree == false && <div className="alert alert-danger" >Please Select Privacy Policy.</div>
                  }
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.name}
                      placeholder="John Doe"
                      name="name"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      We'll never share your name with anyone else.
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <label for="gender" className="select-gender-label">
                      {strings.gender}
                    </label>
                    <br />
                    <Field className="select-gender" as="select" name="gender">
                      <option value="male">{strings.male}</option>
                      <option value="female">{strings.account.female}</option>
                    </Field>
                    <br />
                    <small id="domainHelp" className="form-text text-muted">
                      We'll never share your gender with anyone else.
                    </small>
                  </div>
                  {!setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.email}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {strings.newershare}
                    </small>
                  </div>
                  }
                  {setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.email}
                      placeholder="john.doe@i4ware.fi"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {strings.newershare}
                    </small>
                  </div>
                  }
                  {setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.domain}
                      name="domain"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      You need to know right domain that is in use.
                    </small>
                  </div>
                  }
                  {!setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.domain}
                      placeholder="www.domain.com"
                      name="domain"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      We'll never share your domain with anyone else.
                    </small>
                  </div>
                  }
                  <div className="form-group text-left">
                    <label for="validationCustom03" className={"form-label"}>
                      {strings.password}
                    </label>
                    <PassWordInput
                      label={strings.password}
                      placeholder=""
                      name="password"
                      type="password"
                    />
            <small id="emailHelp" className="form-text text-muted">
            Password is strongly cypted and is secure in our database.
            </small>
                  </div>
                  <div className="form-group text-left">
                    <label for="validationCustom03" className={"form-label"}>
                      {strings.confirmPassword}
                    </label>
                    <PassWordInput
                      label={strings.confirmPassword}
                      placeholder=""
                      name="confirmPassword"
                      type="password"
                    />
            <small id="emailHelp" className="form-text text-muted">
            Password is strongly cypted and is secure in our database.
            </small>
                  </div>
                  {setting.show_captcha && <div className="mt-2">
                    <Captcha onChange={status => setCaptchaSuccess(status)} />
                  </div>}
                  <div className="form-group form-check mt-2">
                    <input type="checkbox" className="form-check-input" id="term" value={"agree"} onChange={(e)=>{
                      if(e.target.checked){
                        setAgree(true);
                      }else{
                        setAgree(false);
                      }
                    }} />
                    <label className="form-check-label" for="term">
                      Agreed on{" "}
                      <a href="https://www.i4ware.fi/#privacy" target="_blank">Privacy Policy</a>{" "}
                      and <a href="https://www.i4ware.fi/#data" target="_blank"> Data Processing Agreement </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={setting.show_captcha?!captchaSuccess:false}
                  >
                    Register
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div className="mt-2">
            <span className="account-question">{strings.account} </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              Login here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(RegistrationForm);

