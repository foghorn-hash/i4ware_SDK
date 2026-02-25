import React, { useState } from "react";
import { useEffect } from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { withRouter } from "react-router-dom";
import TextInput from "./../common/TextInput";
import { useTranslation } from "react-i18next";

const GetSignupSchema = (t) =>
  Yup.object().shape({
    technical_contact_email: Yup.string()
      .email(t('invalidEmail'))
      .required("Required"),
    billing_contact_email: Yup.string()
      .email(t('invalidEmail'))
      .required("Required"),
    mobile_no: Yup.string()
      .typeError(t('mobileNumberStringError'))
      .required("Required"),
    company_name: Yup.string().required("Required"),
    address_line_1: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    zip: Yup.string().required("Required"),
  });

function ManageDomainForm(props) {
  const { t, i18n } = useTranslation();
  const { authState, authActions } = React.useContext(AuthContext);


  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  useEffect(() => {
    console.log(props.location);
    // if(props.location.state == null || props.location.state == undefined){
    //   props.history.push('/manage-domains')
    // }
  }, []);

  const updateForm = (values, formProps) => {
    request()
      .post("/api/manage/domains", values)
      .then((res) => {
        if (res.data.success === true) {
          props.history.push("/manage-domains");
        } else {
          for (const key in res.data.data) {
            if (Object.hasOwnProperty.call(res.data.data, key)) {
              const element = res.data.data[key];
              formProps.setFieldError(key, element[0]);
            }
          }
        }
      });
  };

  return (
    <div style={{ marginTop: "2em", marginBottom: "2em" }}>
      <h3 className="my-2">{t('manageDomain')}</h3>
      <div className="my-2">
        <Formik
          initialValues={
            props.location.state && props.location.state.from === "edit"
              ? {
                ...props.location.state.item,
              }
              : {
                technical_contact_email: "",
                billing_contact_email: "",
                mobile_no: "",
                company_name: "",
                address_line_1: "",
                address_line_2: "",
                city: "",
                country: "",
                zip: "",
                vat_id: "",
              }
          }
          validationSchema={GetSignupSchema(t)}
          onSubmit={(values, formProps) => {
            updateForm(values, formProps);
          }}
        >
          {({ submitForm }) => (
            <form className="row g-3">
              <div className="col-12">
                <TextInput
                  label={t('technicalContactEmail')}
                  name="technical_contact_email"
                />
              </div>
              <div className="col-md-4">
                <TextInput
                  label={t('billingContactEmail')}
                  name="billing_contact_email"
                />
              </div>
              <div className="col-md-4">
                <TextInput
                  type={"tel"}
                  label={t('mobileNumber')}
                  name="mobile_no"
                />
              </div>
              <div className="col-md-4">
                <TextInput label={t('vatId')} name="vat_id" />
              </div>
              <div className="col-md-12">
                <TextInput label={t('companyName')} name="company_name" />
              </div>
              <div className="col-12">
                <TextInput label={t('addressLine1')} name="address_line_1" />
              </div>
              <div className="col-12">
                <TextInput label={t('addressLine2')} name="address_line_2" />
              </div>
              <div className="col-md-4">
                <TextInput label={t('city')} name="city" />
              </div>
              <div className="col-md-4">
                <TextInput label={t('country')} name="country" />
              </div>
              <div className="col-md-4">
                <TextInput label={t('zip')} name="zip" />
              </div>
              <div className="col-12">
                <button
                  type="button"
                  onClick={() => {
                    submitForm();
                  }}
                  className="btn btn-primary"
                >
                  {t('save')}
                </button>
                <button
                  style={{ marginLeft: "100px" }}
                  type="button"
                  onClick={() => {
                    props.history.push("/manage-domains");
                  }}
                  className="btn btn-primary"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default withRouter(ManageDomainForm);
