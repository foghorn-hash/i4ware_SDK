import React, {useState} from "react";
import {useEffect} from "react";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Formik, Field} from "formik";
import * as Yup from 'yup';
import { withRouter } from "react-router-dom";
import TextInput from "./../common/TextInput";


const SignupSchema = Yup.object().shape({
  technical_contact_email: Yup.string().email('Invalid email').required('Required'),
  billing_contact_email: Yup.string().email('Invalid email').required('Required'),
  mobile_no: Yup.string().typeError('Mobile number should be in string with Contnry Code').required('Required'),
  company_name: Yup.string().required('Required'),
  address_line_1: Yup.string().required('Required'),
  city: Yup.string().required('Required'),
  country: Yup.string().required('Required'),
  zip: Yup.string().required('Required'),
});

function ManageDomainForm(props) {
  const {authState, authActions} = React.useContext(AuthContext);
  
  useEffect(() => {
      console.log(props.location);
      // if(props.location.state == null || props.location.state == undefined){
      //   props.history.push('/manage-domains')
      // }
  }, []);

  
  const updateForm = (values,formProps)=>{
    
    request()
      .post("/api/manage/domains", values)
      .then(res => {
        if(res.data.success == true){
          props.history.push('/manage-domains')
        }else{
          
          for (const key in res.data.data) {
            if (Object.hasOwnProperty.call(res.data.data, key)) {
              const element = res.data.data[key];
              formProps.setFieldError(key,element[0]);
            }
          }

        }
      })
  }

  return (
    <div style={{marginTop: "2em"}}>
      <h3 className="my-2">Manage Domain</h3>
      <div className="my-2">
        <Formik
          initialValues={props.location.state && props.location.state.from === "edit"?{
            ...props.location.state.item
          }:{
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
          }}
          validationSchema={SignupSchema}
          onSubmit={(values,formProps) => {
            updateForm(values,formProps)
          }}
        >
          {({
            submitForm
          }) => (
            <form class="row g-3">
              <div class="col-12">
                <TextInput
                  label={"Technical Contact Email"}
                  name="technical_contact_email"
                />
              </div>
              <div class="col-md-4">
                <TextInput
                  label={"Billing Contact Email"}
                  name="billing_contact_email"
                />
              </div>
              <div class="col-md-4">
                <TextInput type={'tel'}  label={"Mobile Number"} name="mobile_no" />
              </div>
			  <div class="col-md-4">
                <TextInput label={"VAT-ID"} name="vat_id" />
              </div>
              <div class="col-md-12">
                <TextInput label={"Company Name"} name="company_name" />
              </div>
              <div class="col-12">
                <TextInput label={"Address Line 1"} name="address_line_1" />
              </div>
              <div class="col-12">
                <TextInput label={"Address Line 2"} name="address_line_2" />
              </div>
              <div class="col-4">
                <TextInput label={"City"} name="city" />
              </div>
              <div class="col-4">
                <TextInput label={"Country"} name="country" />
              </div>
              <div class="col-4">
                <TextInput label={"Zip"} name="zip" />
              </div>
              <div class="col-12">
                <button type="button" onClick={()=>{
                  submitForm();
                }} class="btn btn-primary">
                  Save
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
