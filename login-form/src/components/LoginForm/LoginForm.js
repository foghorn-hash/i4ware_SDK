import React, {useState} from "react";
import axios from "axios";
import "./LoginForm.css";
import {API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME, ACCESS_USER_DATA} from "../../constants/apiConstants";
import {withRouter} from "react-router-dom";
import {AuthContext} from "./../../contexts/auth.contexts";
import {useContext} from "react";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   email:"Email address",
   enteremail:"Enter email",
   newershare:"We'll never share your email with anyone else.",
   password:"Password",
   submit:"Submit",
   account:"Dont have an account?",
   register:"Register",
   forgot:"or forgot a password?",
   reset:"Reset",
   error:"Unexpected error!",
   error_username_or_password:"Username and password is required",
   error_domain_is_expired:"Username and password do not match or domain subscription is not valid or expired!",
   success_in_login:"Login successful. Redirecting to home page..",
 },
 fi: {
   email:"Sähköpostiosoite",
   enteremail:"Syötä sähköpostiosoite",
   newershare:"Enme koskaan jaa sähköpostiosoitettasi muille.",
   password:"Salasana",
   submit:"Lähetä",
   account:"Onko sinnula tili?",
   register:"Rekisteröidy",
   forgot:"tai unoditko salasanan?",
   reset:"Palauta",
   error:"Odottamaton virhe!",
   error_username_or_password:"Käyttätunnsu tai salasana on pakollinen",
   error_domain_is_expired:"Käyttätunnus ja salasana eivät täsmää tai domainin tilaus ei ole validi tai on umpeuttunut!",
   success_in_login:"Kirjatuminen onnistui. Uudelleen ohjataan kotisivulle..",
 },
 sv: {
  email: "E-postadress",
  enteremail: "Ange e-postadress",
  newershare: "Jag delar aldrig din e-postadress med andra.",
  password: "Lösenord",
  submit: "Skicka",
  account: "Har du ett konto?",
  register: "Registrera dig",
  forgot: "Eller har du glömt lösenordet?",
  reset: "Återställ",
  error: "Oväntat fel!",
  error_username_or_password: "Användarnamn eller lösenord är obligatoriska",
  error_domain_is_expired: "Användarnamn eller lösenord matchar inte, eller domänen är ogiltig eller har löpt ut!",
  success_in_login: "Inloggning lyckades. Omdirigerar till startsidan...",
}
});

function LoginForm(props) {
  const [state, setState] = useState({
    email: "",
    password: "",
    successMessage: null,
  });
  const {authActions} = useContext(AuthContext);
  const [error, setError] = useState(null);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization==null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  const handleChange = e => {
    const {id, value} = e.target;
    setState(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmitClick = e => {
    e.preventDefault();

    if (state.email == "" || state.password == "") {
      return setError(strings.error_username_or_password);
    }

    const payload = {
      email: state.email,
      password: state.password,
    };
    axios
      .post(API_BASE_URL + "/api/users/login", payload)
      .then(function (response) {
        const json_string = JSON.stringify(response);
        const json_parsed = JSON.parse(json_string);
        if (json_parsed.data.success === true) {
          console.log(json_parsed.data.success);
          setState(prevState => ({
            ...prevState,
            successMessage: strings.success_in_login,
          }));

          authActions.authStateChanged({
            user: {
              ...response.data.data,
            permissions:response.data.permissions
            },
            token: response.data.token,
            isLogged: true,
            permissions: response.data.permissions,
          });

          //alert(json_parsed.data.data.token);
          localStorage.setItem(ACCESS_TOKEN_NAME, response.data.token);
          localStorage.setItem(ACCESS_USER_DATA, JSON.stringify({
            ...response.data.data,
            permissions:response.data.permissions
          }));

          redirectToHome();
          setError(null);
        } else if (json_parsed.data.success === false) {
          console.log(json_parsed.data.success);
          setError(strings.error);
        } else {
          console.log(json_parsed.data.success);
          setError(
            strings.error_domain_is_expired
          );
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
  const redirectToPasswordReset = () => {
    props.history.push("/reset-password");
    props.updateTitle("Reset a Password");
  };

  return (
    <>
    <div className="d-flex justify-content-center">
      <div className="animated-card"> 
        <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
          {error && (
            <div
              className="alert alert-danger mt-2"
              style={{display: error ? "block" : "none"}}
              role="alert"
            >
              {error}
            </div>
          )}
          <form className="Login-form">
            <div className="form-group text-left">
              <label htmlFor="exampleInputEmail1">{strings.email}</label>
              <input
                type="email"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                placeholder={strings.enteremail}
                value={state.email}
                onChange={handleChange}
              />
              <small id="emailHelp" className="form-text text-muted">
              {strings.newershare}
              </small>
            </div>
            <div className="form-group text-left">
              <label htmlFor="exampleInputPassword1">{strings.password}</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder={strings.password}
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
              {strings.submit}
            </button>
          </form>
          <div
            className="alert alert-success mt-2"
            style={{display: state.successMessage ? "block" : "none"}}
            role="alert"
          >
            {state.successMessage}
          </div>
          <div className="registerMessage">
            <span>{strings.account} </span>
            <span className="loginText" onClick={() => redirectToRegister()}>
            {strings.register}
            </span>
        <span> {strings.forgot} </span>
            <span className="loginText" onClick={() => redirectToPasswordReset()}>
            {strings.reset}
            </span>
          </div>
        </div>
        <div className="login-form-spacer"></div>
      </div>
    </div>
    <div className="login-form-spacer"></div>
    </>
  );
}

export default withRouter(LoginForm);
