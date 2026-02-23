import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LoginForm.css";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME, ACCESS_USER_DATA } from "../../constants/apiConstants";
import { withRouter } from "react-router-dom";
import { AuthContext } from "./../../contexts/auth.contexts";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

function LoginForm(props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({
    email: "",
    password: "",
    successMessage: null,
  });
  const { authActions } = useContext(AuthContext);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  const handleChange = e => {
    const { id, value } = e.target;
    setState(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmitClick = e => {
    e.preventDefault();

    if (state.email == "" || state.password == "") {
      return setError(t('error_username_or_password'));
    }

    const payload = {
      email: state.email,
      password: state.password,
    };
    axios
      .post(API_BASE_URL + "/api/users/login", payload, { withCredentials: true })
      .then(function (response) {
        const json_string = JSON.stringify(response);
        const json_parsed = JSON.parse(json_string);
        if (json_parsed.data.success === true) {
          setState(prevState => ({
            ...prevState,
            successMessage: t('success_in_login'),
          }));

          authActions.authStateChanged({
            user: {
              ...response.data.data,
              permissions: response.data.permissions
            },
            token: response.data.token,
            isLogged: true,
            permissions: response.data.permissions,
          });

          //alert(json_parsed.data.data.token);
          localStorage.setItem(ACCESS_TOKEN_NAME, response.data.token);
          localStorage.setItem(ACCESS_USER_DATA, JSON.stringify({
            ...response.data.data,
            permissions: response.data.permissions
          }));

          redirectToHome();
          setError(null);
        } else if (json_parsed.data.success === false) {
          console.log(json_parsed.data.success);
          setError(t('error'));
        } else {
          console.log(json_parsed.data.success);
          setError(
            t('error_domain_is_expired')
          );
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
  const redirectToPasswordReset = () => {
    props.history.push("/reset-password");
  };

  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
          {error && (
            <div
              className="alert alert-danger mt-2"
              style={{ display: error ? "block" : "none" }}
              role="alert"
            >
              {error}
            </div>
          )}
          <form className="Login-form">
            <div className="form-group text-left">
              <label htmlFor="exampleInputEmail1">{t('email')}</label>
              <input
                type="email"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                placeholder={t('enteremail')}
                value={state.email}
                onChange={handleChange}
              />
              <small id="emailHelp" className="form-text text-muted">
                {t('newershare')}
              </small>
            </div>
            <div className="form-group text-left">
              <label htmlFor="exampleInputPassword1">{t('password')}</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder={t('password')}
                value={state.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-check"></div>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmitClick}
            >
              {t('submit')}
            </button>
          </form>
          <div
            className="alert alert-success mt-2"
            style={{ display: state.successMessage ? "block" : "none" }}
            role="alert"
          >
            {state.successMessage}
          </div>
          <div className="registerMessage">
            <span>{t('account')} </span>
            <span className="loginText" onClick={() => redirectToRegister()}>
              {t('register')}
            </span>
            <span> {t('forgot')} </span>
            <span className="loginText" onClick={() => redirectToPasswordReset()}>
              {t('reset')}
            </span>
          </div>
        </div>
        <div className="login-form-spacer"></div>
      </div>
      <div className="login-form-spacer"></div>
    </>
  );
}

export default withRouter(LoginForm);
