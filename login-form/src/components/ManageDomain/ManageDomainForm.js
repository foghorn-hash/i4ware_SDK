import React, { useState } from "react";
import { useEffect } from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { withRouter } from "react-router-dom";
import TextInput from "./../common/TextInput";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    manageDomain: "Manage Domain",
    technicalContactEmail: "Technical Contact Email",
    billingContactEmail: "Billing Contact Email",
    mobileNumber: "Mobile Number",
    companyName: "Company Name",
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    city: "City",
    country: "Country",
    zip: "Zip",
    vatId: "VAT-ID",
    save: "Save",
    invalidEmail: "Invalid email",
    required: "Required",
    mobileNumberStringError:
      "Mobile number should be in string with Country Code",
  },
  fi: {
    manageDomain: "Hallinnoi Domainia",
    technicalContactEmail: "Tekninen Yhteyshenkilön Sähköposti",
    billingContactEmail: "Laskutuksen Yhteyshenkilön Sähköposti",
    mobileNumber: "Matkapuhelinnumero",
    companyName: "Yrityksen Nimi",
    addressLine1: "Osoite 1",
    addressLine2: "Osoite 2",
    city: "Kaupunki",
    country: "Maa",
    zip: "Postinumero",
    vatId: "ALV-tunnus",
    save: "Tallenna",
    invalidEmail: "Virheellinen sähköpostiosoite",
    required: "Vaadittu",
    mobileNumberStringError:
      "Matkapuhelinnumeron tulee olla merkkijonona maakoodin kanssa",
  },
  sv: {
    manageDomain: "Hantera domän",
    technicalContactEmail: "Teknisk kontaktpersons e-post",
    billingContactEmail: "Faktureringskontaktpersons e-post",
    mobileNumber: "Mobilnummer",
    companyName: "Företagsnamn",
    addressLine1: "Adressrad 1",
    addressLine2: "Adressrad 2",
    city: "Stad",
    country: "Land",
    zip: "Postnummer",
    vatId: "Momsnummer",
    save: "Spara",
    invalidEmail: "Ogiltig e-postadress",
    required: "Obligatoriskt",
    mobileNumberStringError: "Mobilnummer måste vara en sträng med landskod",
  },
});

const SignupSchema = Yup.object().shape({
  technical_contact_email: Yup.string()
    .email("Invalid email")
    .required("Required"),
  billing_contact_email: Yup.string()
    .email("Invalid email")
    .required("Required"),
  mobile_no: Yup.string()
    .typeError("Mobile number should be in string with Contnry Code")
    .required("Required"),
  company_name: Yup.string().required("Required"),
  address_line_1: Yup.string().required("Required"),
  city: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
  zip: Yup.string().required("Required"),
});

var query = window.location.search.substring(1);
var urlParams = new URLSearchParams(query);
var localization = urlParams.get("lang");

if (localization == null) {
  strings.setLanguage(API_DEFAULT_LANGUAGE);
} else {
  strings.setLanguage(localization);
}

function ManageDomainForm(props) {
  const { authState, authActions } = React.useContext(AuthContext);

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
      <h3 className="my-2">{strings.manageDomain}</h3>
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
          validationSchema={SignupSchema}
          onSubmit={(values, formProps) => {
            updateForm(values, formProps);
          }}
        >
          {({ submitForm }) => (
            <form className="row g-3">
              <div className="col-12">
                <TextInput
                  label={strings.technicalContactEmail}
                  name="technical_contact_email"
                />
              </div>
              <div className="col-md-4">
                <TextInput
                  label={strings.billingContactEmail}
                  name="billing_contact_email"
                />
              </div>
              <div className="col-md-4">
                <TextInput
                  type={"tel"}
                  label={strings.mobileNumber}
                  name="mobile_no"
                />
              </div>
              <div className="col-md-4">
                <TextInput label={strings.vatId} name="vat_id" />
              </div>
              <div className="col-md-12">
                <TextInput label={strings.companyName} name="company_name" />
              </div>
              <div className="col-12">
                <TextInput label={strings.addressLine1} name="address_line_1" />
              </div>
              <div className="col-12">
                <TextInput label={strings.addressLine2} name="address_line_2" />
              </div>
              <div className="col-md-4">
                <TextInput label={strings.city} name="city" />
              </div>
              <div className="col-md-4">
                <TextInput label={strings.country} name="country" />
              </div>
              <div className="col-md-4">
                <TextInput label={strings.zip} name="zip" />
              </div>
              <div className="col-12">
                <button
                  type="button"
                  onClick={() => {
                    submitForm();
                  }}
                  className="btn btn-primary"
                >
                  {strings.save}
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
