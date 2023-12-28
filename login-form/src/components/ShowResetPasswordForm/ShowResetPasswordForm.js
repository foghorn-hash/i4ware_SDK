import React, {useEffect, useState} from "react";
import axios from "axios";
import "./ShowResetPasswordForm.css";
import {API_BASE_URL} from "../../constants/apiConstants";
import {AuthContext} from "./../../contexts/auth.contexts";
import {withRouter} from "react-router-dom";
import {useContext} from "react";
import {Field, Form, Formik} from "formik";
import request from "../../utils/Request";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from "demos-react-captcha";
import "./../../captcha.css";

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
      "Password and Confirm password should be same."
    ),
});

function ShowResetPasswordForm(props) {
  const [state, setState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    successMessage: null,
  });

  const [error, setError] = useState(null);
  const [agree, setAgree] = useState(false);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);

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
      .post(API_BASE_URL + "/api/users/reset-password?token="+token, values)
      .then(function (response) {
        const json_string = JSON.stringify(response);
        const json_parsed = JSON.parse(json_string);
        if (json_parsed.data.success === true) {
          setState(prevState => ({
            ...prevState,
            successMessage:
              "Password reset successful.",
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
    <div className="reset d-flex justify-content-center">
      <div className="animated-card">
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
              confirmPassword: "",
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
                      label={"Email"}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
              <small id="emailHelp" className="form-text text-muted">
                We'll never share your email with anyone else.
              </small>
            </div>
        <div className="form-group text-left">
                    <label for="validationCustom03" className={"form-label"}>
                      {"Password"}
                    </label>
                    <PassWordInput
                      label={"Password"}
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
                      {"Confirm Password"}
                    </label>
                    <PassWordInput
                      label={"Confirm Password"}
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
            <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={setting.show_captcha?!captchaSuccess:false}
            >
                Submit
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
              Register
            </span>
        <span> or login? </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(ShowResetPasswordForm);
