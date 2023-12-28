import React, { useState } from "react";
import { useEffect } from "react";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import Button from "react-bootstrap/Button";
import "./ManageUsers.css";
import Modal from "./../Modal/Modal.js";
import ModalApproval from "./../ModalApproval/ModalApproval.js";
import ModalActivate from "./../ModalActivate/ModalActivate.js";
import ModalPasswordChange from "./../ModalPasswordChange/ModalPasswordChange.js";
import Spinner from "react-bootstrap/Spinner";
import isEmpty from "lodash/isEmpty";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Select from "react-select";
import PermissionGate from "../../contexts/PermissionGate";
import { FormCheck } from "react-bootstrap";
import ChangePassword from "./ChangePassword";
import LOADING from "../../1487-loading.gif";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import { render } from "react-dom";
import { ReactGrid, Column, Row } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

function ManageAdmin() {
  const [data, setData] = useState(null);
  const [modalState, setModalState] = useState(false);
  const [modalStateApproval, setModalStateApproval] = useState(null);
  const [modalStateActivate, setModalStateActivate] = useState(false);
  const [modalStatePassword, setModalStatePassword] = useState(null);
  const [modalStateChangeRole, setModalStateChangeRole] = useState(false);
  const [changeRoleUserId, setChangeRoleUserId] = useState(false);
  const { authState, authActions } = React.useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [rolesforusers, setRolesforUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  //const [defaultImage, setDefaultImage] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await request().get("/api/manage/users");
        setData(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
  
    const fetchRolesForAdd = async () => {
      try {
        const res = await request().get("/api/manage/roles/foradd");
        setRolesforUsers(res.data);
      } catch (error) {
        console.error(error);
      }
    };
  
    const fetchAllRoles = async () => {
      try {
        const res = await request().get("/api/manage/roles/all");
        setRoles(res.data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchUsers();
    fetchRolesForAdd();
    fetchAllRoles();
  }, []);

  const nextPage = (url) => {
    request()
      .get(url)
      .then((res) => {
        setData(res.data.data);
      });
  };

  const changeRole = (values) => {
    request()
      .post("/api/manage/roles/setRole", {
        ...values,
        userid: changeRoleUserId,
      })
      .then((res) => {
        setModalStateChangeRole(false);
        request()
          .get("/api/manage/users")
          .then((res) => {
            setData(res.data.data);
          });
      });
  };

  const userStatusHandler = () => {
    request()
      .post("/api/manage/users/change-status", {
        id: modalStateApproval,
      })
      .then((res) => {
        setModalStateApproval(null);
        request()
          .get("/api/manage/users")
          .then((res) => {
            setData(res.data.data);
          });
      });
  };

  const userPasswordHandler = (values) => {
    request()
      .post("/api/manage/users/change-password", {
        id: modalStatePassword,
        ...values
      })
      .then((res) => {
        setModalStatePassword(null);
        request()
          .get("/api/manage/users")
          .then((res) => {
            setData(res.data.data);
          });
      });
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    alert(event.target.value);
  }

  if (!data) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <>
      <Modal show={modalState}>
        {
          <div>
            <h1>Add User</h1>
            <Formik
              initialValues={{
                name: "",
                email: "",
                role: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values)=>{
                console.log(values)
                request()
                .post("/api/manage/users/add-user", {
                  ...values
                })
                .then((res) => {
                  setModalState(false);
                  request()
                    .get("/api/manage/users")
                    .then((res) => {
                      setData(res.data.data);
                    });
                });
              }}
            >
             {({ errors,submitForm })=>(
               <form className="row">
               <div className="col-12">
                 <TextInput
                   placeholder="Fullname"
                   label={"Fullname"}
                   name="name"
                 />
               </div>
               <div className="col-12 mt-2">
                <label for="validationCustom03" className={"form-label"}>
                   {"Gender"}
                </label>
                <br />
                <Field className="select-role" as="select" name="gender">
                    <option value="male">Male</option>
                  <option value="female">Female</option>
                </Field>
              </div>
               <div className="col-12 mt-2">
                 <TextInput
                   label={"Email "}
                   placeholder="Email"
                   name="email"
                 />
               </div>
               <div className="col-12 mt-2">
                <label for="validationCustom03" className={"form-label"}>
                   {"Role"}
                </label>
                <br />
                <Field className="select-role" as="select" name="role">
                      <option key="0" value="NULL">not-assigned</option>
                  {rolesforusers.map((item, index) => {
                    return (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    );
                  })}
                </Field>
              </div>
               <div className="form-group  mt-2 text-left">
                 <label for="validationCustom03" className={"form-label"}>
                   {"Password"}
                 </label>
                 <PassWordInput
                   label={"Password"}
                   placeholder=""
                   name="password"
                   type="password"
                 />
               </div>
               <div className="form-group  mt-2 text-left">
                 <label for="validationCustom03" className={"form-label"}>
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
                <Button onClick={submitForm} >Add</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalState(false)} >Close</Button>
              </div>
            </div>
             </form>
             )}
            </Formik>
            
          </div>
        }
      </Modal>
      <ModalApproval show={modalStateApproval !== null}>
        {
          <div>
            <h1>Are you sure?</h1>
            <div>
              Are you sure about that you want to change this user status?
            </div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button onClick={userStatusHandler}>Yes</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalStateApproval(null)}>No</Button>
              </div>
            </div>
          </div>
        }
      </ModalApproval>
      <ModalActivate show={modalStateActivate}>
        {
          <div>
            <h1>Are you sure?</h1>
            <div>Are you sure about that you want to activate this user?</div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button>Yes</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalStateActivate(false)}>No</Button>
              </div>
            </div>
          </div>
        }
      </ModalActivate>
      <ModalPasswordChange show={modalStatePassword}>
        <ChangePassword closeModel={()=>{
          setModalStatePassword(null);
        }} onSubmit={(values)=>{
          userPasswordHandler(values)
        }} userId={modalStatePassword} />
      </ModalPasswordChange>
      {
        <PermissionGate permission={"users.addUser"}>
          <div className="button-bar">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalState(true)}
              disabled={!rolesforusers || rolesforusers.length === 0}
            >
              Add User
            </Button>
          </div>
        </PermissionGate>
      }
      <table className="table mt-3">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">ID</th>
            <th scope="col">Ava.</th>
            <th scope="col">Name</th>
            <th scope="col">Verified</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Domain</th>
            <th scope="col">Status</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.data.map((item, index) => {
              const profilePicUrl = item.profile_picture_path ? (API_BASE_URL + item.profile_picture_path.replaceAll('public/uploads', '/storage/uploads')) : null;
              const defaultImg = item.gender === "male" ? DefaultMaleImage : DefaultFemaleImage;
              return (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>{item.id}</td>
                  <td><img className="max-height-profile-pic-manage-users" src={profilePicUrl || defaultImg} /></td>
                  <td>{item.name}</td>
                  <td>
                    {item.email_verified_at != null && "true"}{" "}
                    {item.email_verified_at == null && "false"}
                  </td>
                  <td>{item.email}</td>
                  <td>{item.roles ? item.roles.name : "not-assigned"}</td>
                  <td>{item.domain}</td>
                  <td>
                    <FormCheck
                      type="switch"
                      disabled
                      checked={item.is_active === 1 ? true : false}
                      label=""
                      onClick={() => {
                        console.log(item.id);
                      }}
                    />
                  </td>
                  <>
                    <td>
                      <PermissionGate permission={"users.changePassword"}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setModalStatePassword(item.id)}
                        >
                          Change Password
                        </Button>
                      </PermissionGate>
                    </td>
                    <td>
                      <PermissionGate permission={"users.changeRole"}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setModalStateChangeRole(true);
                            setChangeRoleUserId(item.id);
                          }}
                        >
                          Change Role
                        </Button>
                      </PermissionGate>
                    </td>
                    <td>
                      <PermissionGate permission={"users.statusChange"}>
                        <Button
                          variant={"primary"}
                          size="sm"
                          onClick={() => setModalStateApproval(item.id)}
                        >
                          {item.is_active === 1
                            ? "Deactivate User"
                            : "Active User"}
                        </Button>
                      </PermissionGate>
                    </td>
                  </>
                </tr>
              );
            })}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          {data &&
            data.links.map((link, index) => {
              return (
                <li
                  key={index + 1}
                  className={link.active ? "page-item active" : "page-item"}
                  onClick={() => {
                    if (link.url) {
                      nextPage(link.url);
                    }
                  }}
                >
                  <button
                    className={
                      link.url == null ? "disabled page-link" : "page-link"
                    }
                    href="#"
                    disabled={link.url == null}
                  >
                    {link.label.includes("Previous")
                      ? "Previous"
                      : link.label.includes("Next")
                      ? "Next"
                      : link.label}
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>
      <Modal show={modalStateChangeRole}>
        {
          <div className="">
            <h1>Change Role</h1>
            <Formik
              initialValues={{
                roleId: "",
              }}
              onSubmit={(values) => {
                changeRole(values);
              }}
            >
              {({ setFieldValue }) => (
                <Form className="row py-4">
                  <div className="col-12">
                    <select
                      name="roleId"
                      className="form-control"
                      onChange={(e) => {
                        setFieldValue("roleId", e.target.value);
                      }}
                    >
                      <option key="0" value="NULL">not-assigned</option>
                      {roles.map((item) => {
                        return <option value={item.id}>{item.name}</option>;
                      })}
                    </select>
                  </div>

                  <div className="spacer"></div>
                  <div>
                    <div className="float-left">
                      <Button type="submit">Submit</Button>
                    </div>
                    <div className="float-right">
                      <Button
                        type="button"
                        onClick={() => setModalStateChangeRole(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        }
      </Modal>
    </>
  );
}

export default ManageAdmin;
