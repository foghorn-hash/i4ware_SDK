import React, {useState} from "react";
import {useEffect} from "react";
import {AuthContext} from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import {Formik, Field} from "formik";
import * as Yup from 'yup';
import { withRouter } from "react-router-dom";
import TextInput from "../common/TextInput";


const validateSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
});

function RoleForm(props) {
  const {authState, authActions} = React.useContext(AuthContext);
  const [permissions, setPermission] = React.useState([]);
  const [editRole, setEditRole] = React.useState(null);
  const [selectPermissions, setSelectPermissions] = React.useState([]);

  useEffect(()=>{
    // fetch permission
    let params = {}
    if(props.location.state) {
      params = {
        params: {
          roleId: props.location.state && props.location.state.item ? props.location.state.item.id : ''
        }
      }
      setEditRole(props.location.state.item)
      
    }
    request()
      .get("/api/manage/permissions", params)
      .then(res => {
        setPermission(res.data.data);
        if(res.data.allowedPermissions){
          const selectedPermissions = res.data.allowedPermissions.map((elm)=>{
            return elm.permission_id
          })
          setSelectPermissions(selectedPermissions);
        }
      })
  }, [authActions]);

  const updateForm = (values,formProps)=>{
    console.log({values})
    

    request()
      .post("/api/manage/roles", {
        name: values.name,
        isActive: 1,
        permissions: selectPermissions,
        id: editRole?editRole.id:null,
      })
      .then(res => {
        if(res.data.success === true){
          props.history.push('/manage-roles')
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
      <h3 className="my-2">{editRole?'Edit Role':'Add Role'}</h3>
      <div className="my-2">
        <Formik
          initialValues={{
            name: editRole?editRole.name:"",
            isactive: false,
          }}
          enableReinitialize
          validationSchema={validateSchema}
          onSubmit={(values,formProps) => {
            updateForm(values,formProps)
          }}
        >
          {({
            submitForm,
            values
          }) => (
            <form class="row g-3 mt-5">
              <div class="col-12" >
              <div class="col-4">
                <TextInput
                  label={"Role Name"}
                  name="name"
                  value={values.name}
                />
              </div>
              </div>
              <div class="w-50 col-12 row mt-3">
                <h5>Permission :</h5>
                {
                  permissions.map((permission)=>{
                    var domain;
                    if (permission.domain==null) { domain = "All domains"; } else { domain = permission.domain; }
                    return <div className="col-4" >
                      
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" value={permission.id} id={'permission_' + permission.id} onChange={(e)=>{
                          if(e.target.checked === true){
                            setSelectPermissions([ ...selectPermissions, permission.id ]);
                          } else {
                            const filterPermission = selectPermissions.filter((sp) => sp !== permission.id);
                            setSelectPermissions([...filterPermission]);
                          }
                        }} checked={selectPermissions.includes(permission.id)?true:false} />
                        <label class="form-check-label noselect" for={'permission_' + permission.id}>
                          {permission.permission_name}<br />({domain})
                        </label>
                      </div>
                    </div>
                  })
                }
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

export default withRouter(RoleForm);
