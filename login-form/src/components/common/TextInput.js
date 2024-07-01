import {Formik, Field} from "formik";
import React, {useState} from "react";
import "./TextInput.css"; 

function TextInput(props) {
  return (
    <Field {...props}>
      {({
        field, // { name, value, onChange, onBlur }
        form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => (
        <>
          <label for="validationCustom03" className={"form-label"}>
            {props.label}
          </label>
          <input
            type={props.type}
            className={
              meta.touched && meta.error
                ? "form-control is-invalid "
                : "form-control"
            }
            {...props}
            {...field}
          />
          {meta.touched && meta.error && (
            <div class="invalid-feedback">{meta.error}</div>
          )}
        </>
      )}
    </Field>
  );
}

function PassWordInput(props) {
  const [show, setShow] = useState(false);

  return (
    <Field {...props}>
      {({
        field, // { name, value, onChange, onBlur }
        form: {touched, errors}, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        meta,
      }) => (
        <>
         <div className="input-container">
          <div className="input-group"
          >
            <input
              type={!show ? "password" : "text"}
              className={
                meta.touched && meta.error
                  ? "form-control is-invalid "
                  : "form-control"
              }
              {...field}
            />

            <div class="input-group-append">
              <span
                class="input-group-text"
                id="validationTooltipUsernamePrepend"
                onClick={() => {
                  setShow(!show);
                }}
              >
                {show && (
                  <span class="">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.885 14.988l3.104-3.098.011.11c0 1.654-1.346 3-3 3l-.115-.012zm8.048-8.032l-3.274 3.268c.212.554.341 1.149.341 1.776 0 2.757-2.243 5-5 5-.631 0-1.229-.13-1.785-.344l-2.377 2.372c1.276.588 2.671.972 4.177.972 7.733 0 11.985-8.449 11.985-8.449s-1.415-2.478-4.067-4.595zm1.431-3.536l-18.619 18.58-1.382-1.422 3.455-3.447c-3.022-2.45-4.818-5.58-4.818-5.58s4.446-7.551 12.015-7.551c1.825 0 3.456.426 4.886 1.075l3.081-3.075 1.382 1.42zm-13.751 10.922l1.519-1.515c-.077-.264-.132-.538-.132-.827 0-1.654 1.346-3 3-3 .291 0 .567.055.833.134l1.518-1.515c-.704-.382-1.496-.619-2.351-.619-2.757 0-5 2.243-5 5 0 .852.235 1.641.613 2.342z" />
                    </svg>
                  </span>
                )}
                {!show && (
                  <span class="">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z" />
                    </svg>
                  </span>
                )}
              </span>
            </div>
          </div>
        
          {meta.touched && meta.error && (
            <div className="invalid-feedback">{meta.error}</div>
            )}
          </div>
        </>
      )}
    </Field>
  );
}

export {PassWordInput};
export default TextInput;
