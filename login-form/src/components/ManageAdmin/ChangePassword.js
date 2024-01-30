import { Formik, Field, Form } from "formik";
import React, { useState } from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Button from "react-bootstrap/Button";
import * as Yup from 'yup';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    passwordChange: "Password Change",
    password: "Password",
    confirmPassword: "Confirm Password",
    change: "Change",
    close: "Close"
  },
  fi: {
    passwordChange: "Salasanan Vaihto",
    password: "Salasana",
    confirmPassword: "Vahvista Salasana",
    change: "Vaihda",
    close: "Sulje"
  }
});

const passwordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string().required('Confirm Password is required').oneOf([Yup.ref('password'), null], 'Passwords must match')
});

var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

function ChangePassword({ closeModel, userId, onSubmit }) {
  return (
    
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        enableReinitialize
        validationSchema={passwordSchema}
        onSubmit={(values) => {
          onSubmit(values)
        }}
      >
        {({ values,errors, touched, submitForm })=> (
            <Form>
            <div>
            <h1>{strings.passwordChange}</h1>
  
            <div className="form-group text-left">
              <label for="validationCustom05" className={"form-label"}>
                {"Password"}
              </label>
              <PassWordInput
                label={"Password"}
                placeholder=""
                name="password"
                type="password"
              />
            </div>
            <div className="form-group text-left">
              <label for="validationCustom05" className={"form-label"}>
                {"Confirm Password"}
              </label>
              <PassWordInput
                label={"Confirm Password"}
                placeholder=""
                name="confirmPassword"
                type="password"
              />
            </div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button type="submit" >{strings.change}</Button>
              </div>
              <div className="float-right">
                <Button type="button" onClick={closeModel}>{strings.close}</Button>
              </div>
            </div>
          </div>
        </Form>
        )}
      </Formik>
  );
}

export default ChangePassword;
