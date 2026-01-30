import React, {useEffect, useState} from "react";
import "./RegistrationForm.css";
import {API_BASE_URL, API_DEFAULT_LANGUAGE, APP_RECAPTCHA_SITE_KEY} from "../../constants/apiConstants";
import {Redirect, withRouter} from "react-router-dom";
import {AuthContext} from "./../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Captcha from 'react-google-recaptcha';
// ES6 module syntax
import LocalizedStrings from 'react-localization';
import ErrorRegistration from "./ErrorRegistration";
import axios from "axios";

let strings = new LocalizedStrings({
  en:{
    email:"Email",
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
    company_name: "Company Name",
    neverShareCompany: "We'll never share your company name with anyone else.",
    success_registration:"Registration successful and verification email has been sent.",
    selectPrivacyPolicy: "Please Select Privacy Policy.",
    neverShareName: "We'll never share your name with anyone else.",
    neverShareGender: "We'll never share your gender with anyone else.",
    domainInUse: "You need to know right domain that is in use.",
    neverShareDomain: "We'll never share your domain with anyone else.",
    passwordStronglyCrypted: "Password is strongly encrypted and is secure in our database.",
    privacyPolicy: "Privacy Policy",
    dataProcessingAgreement: "Data Processing Agreement",
    agreedOn: "Agreed on",
    and: "and",
    required: "Required",
    register: "Register",
    loginHere: "Login here",
    tooLong: "Too Long!",
    tooShort: "Too Short!",
    invalidEmail: "Invalid email",
    invalidDomain: "Domain is invalid",
    passwordsDontMatch: "Password and Confirm password should be same.",
    vat_id: "VAT ID",
    neverShareVatId: "We'll never share your VAT ID with anyone else.",
    business_id: "Business ID",
    neverShareBusinessId: "We'll never share your Business ID with anyone else.",
    address_line_1: "Address Line 1",
    neverShareAddress: "We'll never share your address with anyone else.",
    address_line_2: "Address Line 2",
    city: "City",
    neverShareCity: "We'll never share your city with anyone else.",
    country: "Country",
    neverShareCountry: "We'll never share your country with anyone else.",
    zip: "ZIP",
    neverShareZip: "We'll never share your ZIP with anyone else.", 
    mobile_no: "Phone Number", 
    neverShareMobileNo: "We'll never share your phone number with anyone else.", 
  },
  fi: {
    email:"Sähköposti",
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
    company_name: "Yrityksen nimi",
    neverShareCompany: "Emme koskaan jaa yrityksesi nimeä kenenkään muun kanssa.",
    success_registration:"Rekisteräinti onnistui ja vahvistus sähköposti on lähetetty.",
    selectPrivacyPolicy: "Valitse tietosuojakäytäntö.",
    neverShareName: "Emme koskaan jaa nimeäsi kenenkään muun kanssa.",
    neverShareGender: "Emme koskaan jaa sukupuoltasi kenenkään muun kanssa.",
    domainInUse: "Sinun on tiedettävä käytössä oleva oikea verkkotunnus.",
    neverShareDomain: "Emme koskaan jaa verkkotunnustasi kenenkään muun kanssa.",
    passwordStronglyCrypted: "Salasana on vahvasti salattu ja turvallinen tietokannassamme.",
    privacyPolicy: "Tietosuojakäytäntö",
    dataProcessingAgreement: "Tietojenkäsittelysopimus",
    agreedOn: "Hyväksyt",
    and: "ja",
    required: "Vaadittu",
    register: "Rekisteröidy",
    loginHere: "Kirjaudu tästä",
    tooLong: "Liian pitkä!",
    tooShort: "Liian lyhyt!",
    invalidEmail: "Virheellinen sähköpostiosoite",
    invalidDomain: "Verkkotunnus on virheellinen",
    passwordsDontMatch: "Salasanan ja vahvistetun salasanan tulee olla sama.",
    vat_id: "ALV-tunnus",
    neverShareVatId: "Emme koskaan jaa ALV-tunnustasi kenenkään muun kanssa.",
    business_id: "Y-tunnus",
    neverShareBusinessId: "Emme koskaan jaa Y-tunnustasi kenenkään muun kanssa.",
    address_line_1: "Osoiterivi 1",
    neverShareAddress: "Emme koskaan jaa osoitettasi kenenkään muun kanssa.",
    address_line_2: "Osoiterivi 2",
    city: "Kaupunki",
    neverShareCity: "Emme koskaan jaa kaupunkiasi kenenkään muun kanssa.",
    country: "Maa",
    neverShareCountry: "Emme koskaan jaa maatasi kenenkään muun kanssa.",
    zip: "Postinumero",
    neverShareZip: "Emme koskaan jaa postinumeroasi kenenkään muun kanssa.",
    mobile_no: "Puhelinnumero",
    neverShareMobileNo: "Emme koskaan jaa puhelinnumeroasi kenenkään muun kanssa.",
  },
  sv: {
    email: "E-post",
    enteremail: "Ange din e-postadress",
    newershare: "Jag delar aldrig din e-postadress med andra.",
    password: "Lösenord",
    male: "Man",
    female: "Kvinna",
    account: "Har redan ett konto?",
    register: "Registrera",
    confirmPassword: "Bekräfta lösenord",
    domain: "Domän",
    error: "Oväntat fel!",
    gender: "Kön",
    name: "Namn",
    company_name: "Företagsnamn",
    neverShareCompany: "Vi delar aldrig ditt företagsnamn med någon annan.",
    success_registration: "Registreringen lyckades och en bekräftelse har skickats till din e-post.",
    selectPrivacyPolicy: "Välj integritetspolicy.",
    neverShareName: "Vi delar aldrig ditt namn med någon annan.",
    neverShareGender: "Vi delar aldrig ditt kön med någon annan.",
    domainInUse: "Du måste ange en giltig domän som inte redan är i användning.",
    neverShareDomain: "Vi delar aldrig din domän med någon annan.",
    passwordStronglyCrypted: "Ditt lösenord är starkt krypterat och säkert i vår databas.",
    privacyPolicy: "Integritetspolicy",
    dataProcessingAgreement: "Dataprocessavtal",
    agreedOn: "Jag godkänner",
    and: "och",
    required: "Obligatoriskt",
    register: "Registrera",
    loginHere: "Logga in här",
    tooLong: "För långt!",
    tooShort: "För kort!",
    invalidEmail: "Ogiltig e-postadress",
    invalidDomain: "Ogiltig domän",
    passwordsDontMatch: "Lösenorden matchar inte.",
    vat_id: "MOMS-ID",
    neverShareVatId: "Vi delar aldrig ditt MOMS-ID med någon annan.",
    business_id: "Företags-ID",
    neverShareBusinessId: "Vi delar aldrig ditt företags-ID med någon annan.",
    address_line_1: "Adressrad 1",
    neverShareAddress: "Vi delar aldrig din adress med någon annan.",
    address_line_2: "Adressrad 2",
    city: "Stad",
    neverShareCity: "Vi delar aldrig din stad med någon annan.",
    country: "Land",
    neverShareCountry: "Vi delar aldrig ditt land med någon annan.",
    zip: "Postnummer",
    neverShareZip: "Vi delar aldrig ditt postnummer med någon annan.",
    mobile_no: "Telefonnummer",
    neverShareMobileNo: "Vi delar aldrig ditt telefonnummer med någon annan.",
}
 });

 var query = window.location.search.substring(1);
 var urlParams = new URLSearchParams(query);
 var localization = urlParams.get('lang');

 if (localization==null) {
   strings.setLanguage(API_DEFAULT_LANGUAGE);
 } else {
   strings.setLanguage(localization);
 }

const SignupSchema = Yup.object().shape({
    name: Yup.string().required(strings.required).max(32, strings.tooLong),
    company_name: Yup.string().required(strings.required).max(255, strings.tooLong),
    business_id: Yup.string().required(strings.required).max(32, strings.tooLong),
    address_line_1: Yup.string().required(strings.required).max(255, strings.tooLong),
    city: Yup.string().required(strings.required).max(255, strings.tooLong),
    zip: Yup.string().required(strings.required).max(255, strings.tooLong),
    gender: Yup.string().required(strings.required).max(6, strings.tooLong),
    email: Yup.string()
      .email(strings.invalidEmail)
      .required(strings.required)
      .max(64, strings.tooLong),
    domain: Yup.string()
      .matches(/([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+/, strings.invalidDomain)
      .required(strings.required),
    password: Yup.string()
      .required(strings.required)
      .min(8, strings.tooShort)
      .max(32, strings.tooLong),
    confirmPassword: Yup.string()
      .required(strings.required)
      .oneOf(
        [Yup.ref("password"), null],
        strings.passwordsDontMatch
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
    // console.log("Sending values to server:", values);

    // request()
    //   .post(API_BASE_URL + "/api/users/register", values)
      axios.post(`${API_BASE_URL}/api/users/register`, {
      recaptcha: captchaValue,
      ...values
    }, values)
      .then( (response) => {
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
            successMessage: json_parsed.message || strings.success_registration,
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
      //         strings.success_registration,
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
    <div className={"registeration d-flex justify-content-center " }>
        {/* {loading && <div className={"loading-view"} ></div>} */}
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
            validationSchema={SignupSchema}
            onSubmit={(values, formProps) => {
              if (agree === true) {
                sendDetailsToServer(values, formProps);
              } else {
                // voisit asettaa myös formik errorin
                formProps.setSubmitting(false);
              }
            }}
          >
            {({submitCount, handleSubmit}) => {
              return (
                <Form onSubmit={handleSubmit} className="Register-form"> 
                  {
                    submitCount > 0 && agree == false && <div className="alert alert-danger" >{strings.selectPrivacyPolicy}</div>
                  }
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.name}
                      placeholder="John Doe"
                      name="name"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      {strings.neverShareName}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <label htmlFor="gender" className="select-gender-label">
                      {strings.gender}
                    </label>
                    <br />
                    <Field className="select-gender" as="select" name="gender">
                      <option value="male">{strings.male}</option>
                      <option value="female">{strings.female}</option>
                    </Field>
                    <br />
                    <small id="domainHelp" className="form-text text-muted">
                      {strings.neverShareGender}
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
                      {strings.domainInUse}
                    </small>
                  </div>
                  }
                  {!setting.disable_registeration_from_others &&
                  <>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.domain}
                      placeholder="www.domain.com"
                      name="domain"
                    />
                    <small id="domainHelp" className="form-text text-muted">
                      {strings.neverShareDomain}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.company_name}
                      placeholder=""
                      name="company_name"
                    />
                    <small id="companyHelp" className="form-text text-muted">
                      {strings.neverShareCompany}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.mobile_no}
                      placeholder=""
                      name="mobile_no"
                    />
                    <small id="mobileHelp" className="form-text text-muted">
                      {strings.neverShareMobileNo}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.vat_id}
                      placeholder=""
                      name="vat_id"
                    />
                    <small id="vatIdHelp" className="form-text text-muted">
                      {strings.neverShareVatId}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.business_id}
                      placeholder=""
                      name="business_id"
                    />
                    <small id="businessIdHelp" className="form-text text-muted">
                      {strings.neverShareBusinessId}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.address_line_1}
                      placeholder=""
                      name="address_line_1"
                    />
                    <small id="addressLine1Help" className="form-text text-muted">
                      {strings.neverShareAddress}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.address_line_2}
                      placeholder=""
                      name="address_line_2"
                    />
                    <small id="addressLine2Help" className="form-text text-muted">
                      {strings.neverShareAddress}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.city}
                      placeholder=""
                      name="city"
                    />
                    <small id="cityHelp" className="form-text text-muted">
                      {strings.neverShareCity}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.country}
                      placeholder=""
                      name="country"
                    />
                    <small id="countryHelp" className="form-text text-muted">
                      {strings.neverShareCountry}
                    </small>
                  </div>
                  <div className="form-group text-left">
                    <TextInput
                      label={strings.zip}
                      placeholder=""
                      name="zip"
                    />
                    <small id="zipHelp" className="form-text text-muted">
                      {strings.neverShareZip}
                    </small>
                  </div>
                  </>
                  }
                  <div className="form-group text-left">
                    <label htmlFor="validationCustom03" className="form-label">
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
                    <label htmlFor="validationCustom03" className="form-label">
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
                  <div className="form-group form-check mt-2">
                    <input type="checkbox" className="form-check-input" id="term" value={"agree"} onChange={(e)=>{
                      if(e.target.checked){
                        setAgree(true);
                      }else{
                        setAgree(false);
                      }
                    }} />
                    <label className="form-check-label" htmlFor="term">
                      {strings.agreedOn}{" "}
                      <a href="https://www.i4ware.fi/privacy-policy/" target="_blank">{strings.privacyPolicy}</a>{" "}
                      {strings.and} <a href="https://www.i4ware.fi/data-processing-agreement/" target="_blank"> {strings.dataProcessingAgreement} </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={setting.show_captcha ? !captchaSuccess || !agree : !agree}
                  >
                    {strings.register}
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div className="mt-2">
            <span className="account-question">{strings.account} </span>
            <span className="loginText" onClick={() => redirectToLogin()}>
              {strings.loginHere}
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

