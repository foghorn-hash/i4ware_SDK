import { Formik, Field, Form } from "formik";
import React, { useState } from "react";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Button from "react-bootstrap/Button";
import * as Yup from 'yup';


const passwordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string().required('Confirm Password is required').oneOf([Yup.ref('password'), null], 'Passwords must match')
});

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
            <h1>Password Change</h1>
  
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
                <Button type="submit" >Change</Button>
              </div>
              <div className="float-right">
                <Button type="button" onClick={closeModel}>Close</Button>
              </div>
            </div>
          </div>
        </Form>
        )}
      </Formik>
  );
}

export default ChangePassword;
