import React, { useState } from "react";
import { useEffect } from "react";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { withRouter } from "react-router-dom";
import TextInput from "../common/TextInput";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    addRole: "Add Role",
    editRole: "Edit Role",
    roleName: "Role Name",
    permission: "Permission :",
    save: "Save",
    required: "Required",
    allDomains: "All domains",
  },
  fi: {
    addRole: "Lisää Rooli",
    editRole: "Muokkaa Roolia",
    roleName: "Roolin Nimi",
    permission: "Oikeudet :",
    save: "Tallenna",
    required: "Vaadittu",
    allDomains: "Kaikki domainit",
  },
  sv: {
    addRole: "Lägg till roll",
    editRole: "Redigera roll",
    roleName: "Rollnamn",
    permission: "Behörigheter:",
    save: "Spara",
    required: "Obligatoriskt",
    allDomains: "Alla domäner",
  },
});

const validateSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
});

function RoleForm(props) {
  const { authState, authActions } = React.useContext(AuthContext);
  const [permissions, setPermission] = React.useState([]);
  const [editRole, setEditRole] = React.useState(null);
  const [selectPermissions, setSelectPermissions] = React.useState([]);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(() => {
    // fetch permission
    let params = {};
    if (props.location.state) {
      params = {
        params: {
          roleId:
            props.location.state && props.location.state.item
              ? props.location.state.item.id
              : "",
        },
      };
      setEditRole(props.location.state.item);
    }
    request()
      .get("/api/manage/permissions", params)
      .then((res) => {
        setPermission(res.data.data);
        if (res.data.allowedPermissions) {
          const selectedPermissions = res.data.allowedPermissions.map((elm) => {
            return elm.permission_id;
          });
          setSelectPermissions(selectedPermissions);
        }
      });
  }, [authActions]);

  const updateForm = (values, formProps) => {
    console.log({ values });

    request()
      .post("/api/manage/roles", {
        name: values.name,
        isActive: 1,
        permissions: selectPermissions,
        id: editRole ? editRole.id : null,
      })
      .then((res) => {
        if (res.data.success === true) {
          props.history.push("/manage-roles");
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
    <div style={{ marginTop: "2em" }}>
      <h3 className="my-2">{editRole ? strings.editRole : strings.addRole}</h3>
      <div className="my-2">
        <Formik
          initialValues={{
            name: editRole ? editRole.name : "",
            isactive: false,
          }}
          enableReinitialize
          validationSchema={validateSchema}
          onSubmit={(values, formProps) => {
            updateForm(values, formProps);
          }}
        >
          {({ submitForm, values }) => (
            <form className="row g-3 mt-5">
              <div className="col-12">
                <div className="col-4">
                  <TextInput
                    label={strings.roleName}
                    name="name"
                    value={values.name}
                  />
                </div>
              </div>
              <div
                className="w-50 col-12 row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridGap: "10px",
                  marginTop: "20px",
                  width: "100%",
                }}
              >
                <h5>{strings.permission}</h5>
                {permissions.map((permission) => {
                  var domain;
                  if (permission.domain == null) {
                    domain = strings.allDomains;
                  } else {
                    domain = permission.domain;
                  }
                  return (
                    <div className="col-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={permission.id}
                          id={"permission_" + permission.id}
                          onChange={(e) => {
                            if (e.target.checked === true) {
                              setSelectPermissions([
                                ...selectPermissions,
                                permission.id,
                              ]);
                            } else {
                              const filterPermission = selectPermissions.filter(
                                (sp) => sp !== permission.id
                              );
                              setSelectPermissions([...filterPermission]);
                            }
                          }}
                          checked={
                            selectPermissions.includes(permission.id)
                              ? true
                              : false
                          }
                        />
                        <label
                          className="form-check-label noselect"
                          htmlFor={"permission_" + permission.id}
                        >
                          {permission.permission_name}
                          <br />({domain})
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="col-12" style={{ marginBottom: "50px" }}>
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
                    props.history.push("/manage-roles");
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

export default withRouter(RoleForm);
