import React, { useEffect, useState } from "react";
import "./RegistrationForm.css";
import { API_BASE_URL, APP_RECAPTCHA_SITE_KEY } from "../../constants/apiConstants";
import { Redirect, withRouter } from "react-router-dom";
import { AuthContext } from "./../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from 'react-google-recaptcha';
import ErrorRegistration from "./ErrorRegistration";
import axios from "axios";
import { useTranslation } from "react-i18next";

const GetSignupSchema = (t) =>
  Yup.object().shape({
  name: Yup.string().required(t('required')).max(32, t('tooLong')),
  company_name: Yup.string().required(t('required')).max(255, t('tooLong')),
  business_id: Yup.string().required(t('required')).max(32, t('tooLong')),
  address_line_1: Yup.string().required(t('required')).max(255, t('tooLong')),
  city: Yup.string().required(t('required')).max(255, t('tooLong')),
  zip: Yup.string().required(t('required')).max(255, t('tooLong')),
  gender: Yup.string().required(t('required')).max(6, t('tooLong')),
  email: Yup.string()
    .email(t('invalidEmail'))
    .required(t('required'))
    .max(64, t('tooLong')),
  domain: Yup.string()
    .matches(/([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+/, t('invalidDomain'))
    .required(t('required')),
  password: Yup.string()
    .required(t('required'))
    .min(8, t('tooShort'))
    .max(32, t('tooLong')),
  confirmPassword: Yup.string()
    .required(t('required'))
    .oneOf(
      [Yup.ref("password"), null],
      t('passwordsDontMatch')
    ),
});

function RegistrationForm(props) {
  const [state, setState] = useState({
    name: "",
    gender: "male",
    email: "",
    domain: "",
    company_name: "",
    vat_id: "",
    business_id: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    country: "",
    zip: "",
    password: "",
    confirmPassword: "",
    successMessage: null,
    recaptcha: "",
  });

  const [error, setError] = useState(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);       // tallennetaan reCAPTCHA:n token
    setCaptchaSuccess(!!value);   // true jos arvo on olemassa
  };

  const { authState, authActions } = React.useContext(AuthContext);
  const [setting, setSetting] = React.useState({
    show_captcha: false,
    disable_registeration_from_others: false
  });


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  useEffect(() => {
    // setLoading(true);
    request()
      .get("/api/settings")
      .then(res => {
        if (res.status == 200) {
          // setLoading(false);
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

  const sendDetailsToServer = (values, formProps) => {
    setLoading(true);
    // console.log("Sending values to server:", values);

    // request()
    //   .post(API_BASE_URL + "/api/users/register", values)
    axios.post(`${API_BASE_URL}/api/users/register`, {
      recaptcha: captchaValue,
      ...values
    }, values)
      .then((response) => {
        console.log("Full response:", response);

        const json_parsed = response.data
        // console.log("Parsed response data:", json_parsed);
        console.log("Server response:", json_parsed);
        // console.log(json_parsed.success);
        // console.log(json_parsed.message);
        // debugger
        if (json_parsed.success) {
          setState((prevState) => ({
            ...prevState,
            successMessage: json_parsed.message || t('success_registration'),
          }));
          setLoading(false);
          setTimeout(() => {
            redirectToLogin();
          }, 5000);
          setModalIsOpen(true);
        } else {
          const errors = [];
          for (const [key, value] of Object.entries(json_parsed.data)) {
            errors.push(...value);
          }
          setErrorMessages(errors);
          setModalIsOpen(true);
          console.log(errors);
        }
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(false);
        // console.error("Error response data:", error.response.data);
      });
    //   if (json_parsed.success === true) {
    //     setState(prevState => ({
    //       ...prevState,
    //       successMessage: json_parsed.message ||
    //         t('success_registration'),
    //     }));
    //     setError(null);

    //     setLoading(false);
    //     setTimeout(()=>{
    //       redirectToLogin();
    //     },5000)
    //   } else {
    //     setLoading(false);
    //     console.log(json_parsed.data);
    //     for (const key in json_parsed.data.data) {
    //       if (Object.hasOwnProperty.call(json_parsed.data.data, key)) {
    //         const element = json_parsed.data.data[key];
    //         formProps.setFieldError(key, element[0]);
    //       }
    //     }
    //   }
    // })
    // .catch(function (error) {
    //   setLoading(false);
    //   console.log(error);
    // });
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const redirectToLogin = () => {
    props.history.push("/login");
  };

  if (authState.isLogged) {
    return <Redirect to={"/home"}></Redirect>;
  }

  return (
    <div className={"registeration d-flex justify-content-center "}>
      {/* {loading && <div className={"loading-view"} ></div>} */}
      <div className="card col-12 col-lg-6 register-card mt-2">
        <div
          className="alert alert-success mt-2"
          style={{ display: state.successMessage ? "block" : "none" }}
          role="alert"
        >
          {state.successMessage}
        </div>
        <Formik
          initialValues={{
            name: "",
            gender: "male",
            email: "",
            domain: "",
            company_name: "",
            mobile_no: "",
            vat_id: "",
            business_id: "",
            address_line_1: "",
            address_line_2: "",
            city: "",
            country: "",
            zip: "",
            password: "",
            confirmPassword: ""
          }}
          validationSchema={GetSignupSchema(t)}
          onSubmit={(values, formProps) => {
            if (agree === true) {
              sendDetailsToServer(values, formProps);
            } else {
              // voisit asettaa myös formik errorin
              formProps.setSubmitting(false);
            }
          }}
        >
          {({ submitCount, handleSubmit }) => {
            return (
              <Form onSubmit={handleSubmit} className="Register-form">
                {
                  submitCount > 0 && agree == false && <div className="alert alert-danger" >{t('selectPrivacyPolicy')}</div>
                }
                <div className="form-group text-left">
                  <TextInput
                    label={t('name')}
                    placeholder="John Doe"
                    name="name"
                  />
                  <small id="domainHelp" className="form-text text-muted">
                    {t('neverShareName')}
                  </small>
                </div>
                <div className="form-group text-left">
                  <label htmlFor="gender" className="select-gender-label">
                    {t('gender')}
                  </label>
                  <br />
                  <Field className="select-gender" as="select" name="gender">
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </Field>
                  <br />
                  <small id="domainHelp" className="form-text text-muted">
                    {t('neverShareGender')}
                  </small>
                </div>
                {!setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={t('email')}
                      placeholder="john.doe@domain.com"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {t('newershare')}
                    </small>
                  </div>
                }
                {setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={t('email')}
                      placeholder="john.doe@i4ware.fi"
                      name="email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                      {t('newershare')}
                    </small>
                  </div>
                }
                {setting.disable_registeration_from_others &&
                  <div className="form-group text-left">
                    <TextInput
                      label={t('domain')}
                      name="domain"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      {t('domainInUse')}
                    </small>
                  </div>
                }
                {!setting.disable_registeration_from_others &&
                  <>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('domain')}
                        placeholder="www.domain.com"
                        name="domain"
                      />
                      <small id="domainHelp" className="form-text text-muted">
                        {t('neverShareDomain')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('company_name')}
                        placeholder=""
                        name="company_name"
                      />
                      <small id="companyHelp" className="form-text text-muted">
                        {t('neverShareCompany')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('mobile_no')}
                        placeholder=""
                        name="mobile_no"
                      />
                      <small id="mobileHelp" className="form-text text-muted">
                        {t('neverShareMobileNo')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('vat_id')}
                        placeholder=""
                        name="vat_id"
                      />
                      <small id="vatIdHelp" className="form-text text-muted">
                        {t('neverShareVatId')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('business_id')}
                        placeholder=""
                        name="business_id"
                      />
                      <small id="businessIdHelp" className="form-text text-muted">
                        {t('neverShareBusinessId')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('address_line_1')}
                        placeholder=""
                        name="address_line_1"
                      />
                      <small id="addressLine1Help" className="form-text text-muted">
                        {t('neverShareAddress')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('address_line_2')}
                        placeholder=""
                        name="address_line_2"
                      />
                      <small id="addressLine2Help" className="form-text text-muted">
                        {t('neverShareAddress')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('city')}
                        placeholder=""
                        name="city"
                      />
                      <small id="cityHelp" className="form-text text-muted">
                        {t('neverShareCity')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('country')}
                        placeholder=""
                        name="country"
                      />
                      <small id="countryHelp" className="form-text text-muted">
                        {t('neverShareCountry')}
                      </small>
                    </div>
                    <div className="form-group text-left">
                      <TextInput
                        label={t('zip')}
                        placeholder=""
                        name="zip"
                      />
                      <small id="zipHelp" className="form-text text-muted">
                        {t('neverShareZip')}
                      </small>
                    </div>
                  </>
                }
                <div className="form-group text-left">
                  <label htmlFor="validationCustom03" className="form-label">
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
                  <label htmlFor="validationCustom03" className="form-label">
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
                <div className="form-group form-check mt-2">
                  <input type="checkbox" className="form-check-input" id="term" value={"agree"} onChange={(e) => {
                    if (e.target.checked) {
                      setAgree(true);
                    } else {
                      setAgree(false);
                    }
                  }} />
                  <label className="form-check-label" htmlFor="term">
                    {t('agreedOn')}{" "}
                    <a href="https://www.i4ware.fi/privacy-policy/" target="_blank">{t('privacyPolicy')}</a>{" "}
                    {t('and')} <a href="https://www.i4ware.fi/data-processing-agreement/" target="_blank"> {t('dataProcessingAgreement')} </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={setting.show_captcha ? !captchaSuccess || !agree : !agree}
                >
                  {t('register')}
                </button>
              </Form>
            );
          }}
        </Formik>
        <div className="mt-2">
          <span className="account-question">{t('account')} </span>
          <span className="loginText" onClick={() => redirectToLogin()}>
            {t('loginHere')}
          </span>
        </div>
      </div>
      <ErrorRegistration
        show={modalIsOpen}
        handleClose={closeModal}
        errorMessages={errorMessages}
        successMessage={state.successMessage}
      />
    </div>
  );
}

export default withRouter(RegistrationForm);

