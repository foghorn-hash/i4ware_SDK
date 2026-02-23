import { Formik, Field, Form } from "formik";
import React, { useEffect, useState } from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Button from "react-bootstrap/Button";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";


const getPasswordSchema = (t) =>
  Yup.object().shape({
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });


function ChangePassword({ closeModel, userId, onSubmit }) {
  const { t, i18n } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);
  return (
    <Formik
      initialValues={{
        password: "",
        confirmPassword: "",
      }}
      enableReinitialize
      validationSchema={getPasswordSchema(t)}
      onSubmit={(values) => {
        onSubmit(values);
      }} 
    >
      {({ values, errors, touched, submitForm }) => (
        <Form>
          <div>
            <h1>{t('passwordChange')}</h1>

            <div className="form-group text-left">
              <label htmlFor="validationCustom05" className={"form-label"}>
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
              <label htmlFor="validationCustom05" className={"form-label"}>
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
                <Button type="submit">{t('change')}</Button>
              </div>
              <div className="float-right">
                <Button type="button" onClick={closeModel}>
                  {t('close')}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ChangePassword;
