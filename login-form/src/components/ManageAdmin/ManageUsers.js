import React, { useState } from "react";
import { useEffect } from "react";
import {
  API_BASE_URL,
  ACCESS_TOKEN_NAME,
} from "../../constants/apiConstants";
import { AuthContext } from "../../contexts/auth.contexts";
import request from "../../utils/Request";
import Button from "react-bootstrap/Button";
import "./ManageUsers.css";
import Modal from "./../Modal/Modal.js";
import ModalApproval from "./../ModalApproval/ModalApproval.js";
import ModalActivate from "./../ModalActivate/ModalActivate.js";
import ModalPasswordChange from "./../ModalPasswordChange/ModalPasswordChange.js";
import ModalVerify from "./../ModalVerify/ModalVerify.js";
import Spinner from "react-bootstrap/Spinner";
import isEmpty from "lodash/isEmpty";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import Select from "react-select";
import PermissionGate from "../../contexts/PermissionGate";
import { FormCheck, Container } from "react-bootstrap";
import ChangePassword from "./ChangePassword";
import LOADING from "../../tube-spinner.svg";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import { render } from "react-dom";
import InfiniteScroll from "react-infinite-scroller";
import axios from "axios"; // Import Axios
import Dropdown from "react-bootstrap/Dropdown";
import { useTranslation } from "react-i18next";



const getValidationSchema = (t) =>
  Yup.object().shape({
    name: Yup.string().required(t("nameRequired")),
    email: Yup.string().email(t("invalidEmail")).required(t("emailRequired")),
    password: Yup.string().min(8, t("passwordMin")).required(t("passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("passwordsMustMatch"))
      .required(t("confirmPasswordRequired")), // Fixed from t("confirmPassword")
  });

function ManageAdmin() {


  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [modalStateApproval, setModalStateApproval] = useState(null);
  const [modalStateActivate, setModalStateActivate] = useState(false);
  const [modalStatePassword, setModalStatePassword] = useState(null);
  const [modalStateVerfiy, setModalStateVerify] = useState(null);
  const [modalStateChangeRole, setModalStateChangeRole] = useState(false);
  const [changeRoleUserId, setChangeRoleUserId] = useState(false);
  const { authState, authActions } = React.useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [rolesforusers, setRolesforUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState([]);

  const handleToggle = (index) => {
    setMenuOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n]);

  useEffect(() => {
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

    fetchRolesForAdd();
    fetchAllRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true); // Set isLoading to true when starting the request
      const response = await axios.get(
        `${API_BASE_URL}/api/manage/users?page=${page}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        }
      );
      const newUsers = response.data;
      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      // Check if there are more pages to load
      if (newUsers.length < 10) {
        setHasMore(false);
      } else {
        // Increment the page number
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Set isLoading to false when the request is complete
    }
  };

  const loadMore = () => {
    //console.log("loadMore, page before update: " + page)
    // Check if there are more items to load and no ongoing request
    if (hasMore && !isLoading) {
      fetchUsers();
    }
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
            setUsers(res.data.data);
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
            setUsers(res.data.data);
          });
      });
  };

  const userVerifyHandler = () => {
    request()
      .post("/api/manage/users/verify", {
        id: modalStateVerfiy,
      })
      .then((res) => {
        setModalStateVerify(null);
        request()
          .get("/api/manage/users")
          .then((res) => {
            setUsers(res.data.data);
          });
      });
  };

  const userPasswordHandler = (values) => {
    request()
      .post("/api/manage/users/change-password", {
        id: modalStatePassword,
        ...values,
      })
      .then((res) => {
        setModalStatePassword(null);
        request()
          .get("/api/manage/users")
          .then((res) => {
            setUsers(res.data.data);
          });
      });
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    alert(event.target.value);
  };

  return (
    <>
      <Modal show={modalState}>
        {
          <div>
            <h1>{t('addUser')}</h1>
            <Formik
              initialValues={{
                name: "",
                gender: "male",
                email: "",
                role: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={getValidationSchema(t)}
              onSubmit={(values) => {
                console.log(values);
                request()
                  .post("/api/manage/users/add-user", {
                    ...values,
                  })
                  .then((res) => {
                    setModalState(false);
                    request()
                      .get("/api/manage/users")
                      .then((res) => {
                        setUsers(res.data.data);
                      });
                  });
              }}
            >
              {({ errors, submitForm }) => (
                <form className="row">
                  <div className="col-12">
                    <TextInput
                      placeholder={t('fullName')}
                      label={t('fullName')}
                      name="name"
                    />
                  </div>
                  <div className="col-12 mt-2">
                    <label
                      htmlFor="validationCustom03"
                      className={"form-label"}
                    >
                      {t('gender')}
                    </label>
                    <br />
                    <Field className="select-role" as="select" name="gender">
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                    </Field>
                  </div>
                  <div className="col-12 mt-2">
                    <TextInput
                      label={t('email')}
                      placeholder="Email"
                      name="email"
                    />
                  </div>
                  <div className="col-12 mt-2">
                    <label
                      htmlFor="validationCustom03"
                      className={"form-label"}
                    >
                      {t('role')}
                    </label>
                    <br />
                    <Field className="select-role" as="select" name="role">
                      <option value="NULL">{t('notAssigned')}</option>
                      {rolesforusers && rolesforusers.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="form-group  mt-2 text-left">
                    <label
                      htmlFor="validationCustom03"
                      className={"form-label"}
                    >
                      {t('password')}
                    </label>
                    <PassWordInput
                      label={"Password"}
                      placeholder=""
                      name="password"
                      type="password"
                    />
                  </div>
                  <div className="form-group  mt-2 text-left">
                    <label
                      htmlFor="validationCustom03"
                      className={"form-label"}
                    >
                      {t('confirmPassword')}
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
                      <Button onClick={submitForm}>{t('addUser')}</Button>
                    </div>
                    <div className="float-right">
                      <Button onClick={() => setModalState(false)}>
                        {t('close')}
                      </Button>
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
            <h1>{t('areYouSure')}</h1>
            <div>{t('wantToChangeUserStatus')}</div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button onClick={userStatusHandler}>{t('yes')}</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalStateApproval(null)}>
                  {t('no')}
                </Button>
              </div>
            </div>
          </div>
        }
      </ModalApproval>
      <ModalVerify show={modalStateVerfiy !== null}>
        {
          <div>
            <h1>{t('areYouSure')}</h1>
            <div>{t('wantToVerifyUser')}</div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button onClick={userVerifyHandler}>{t('yes')}</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalStateVerify(null)}>
                  {t('no')}
                </Button>
              </div>
            </div>
          </div>
        }
      </ModalVerify>
      <ModalActivate show={modalStateActivate}>
        {
          <div>
            <h1>{t('areYouSure')}</h1>
            <div>{t('wantToActivateUser')}</div>
            <div className="spacer"></div>
            <div>
              <div className="float-left">
                <Button>{t('yes')}</Button>
              </div>
              <div className="float-right">
                <Button onClick={() => setModalStateActivate(false)}>
                  {t('no')}
                </Button>
              </div>
            </div>
          </div>
        }
      </ModalActivate>
      <ModalPasswordChange show={modalStatePassword}>
        <ChangePassword
          closeModel={() => {
            setModalStatePassword(null);
          }}
          onSubmit={(values) => {
            userPasswordHandler(values);
          }}
          userId={modalStatePassword}
        />
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
              {t('addUser')}
            </Button>
          </div>
        </PermissionGate>
      }

      <div className="mt-3">
        <div className="table-header">
          <div className="column">#</div>
          <div className="column">ID</div>
          <div className="column">{t('avatar')}</div>
          <div className="column">{t('columnName')}</div>
          <div className="column">{t('columnVerified')}</div>
          <div className="column">{t('email')}</div>
          <div className="column">{t('role')}</div>
          <div className="column">{t('columnDomain')}</div>
          <div className="column">{t('columnStatus')}</div>
          <div className="column">{t('columnActions')}</div>
        </div>

        <div className="table-body">
          <InfiniteScroll
            pageStart={1}
            loadMore={loadMore}
            hasMore={hasMore}
            loader={
              <div className="loading-screen">
                <img src={LOADING} alt="Loading..." key={0} />
              </div>
            }
          >
            {users.map((item, index) => {
              const profilePicUrl = item.profile_picture_path
                ? API_BASE_URL +
                item.profile_picture_path.replaceAll(
                  "public/uploads",
                  "/storage/uploads"
                )
                : null;
              const defaultImg =
                item.gender === "male" ? DefaultMaleImage : DefaultFemaleImage;

              return (
                <div key={item.id} className="mobile-table-body">
                  <div className="mobile-table-header">
                    <div className="column">#</div>
                    <div className="column">ID</div>
                    <div className="column">{t('avatar')}</div>
                    <div className="column">{t('columnName')}</div>
                    <div className="column">{t('columnVerified')}</div>
                    <div className="column">{t('email')}</div>
                    <div className="column">{t('role')}</div>
                    <div className="column">{t('columnDomain')}</div>
                    <div className="column">{t('columnStatus')}</div>
                    <div className="column">{t('columnActions')}</div>
                  </div>

                  <div key={index + 1} className="table-row">
                    <div className="column">{index + 1}</div>
                    <div className="column">{item.id}</div>
                    <div className="column">
                      <img
                        className="max-height-profile-pic-manage-users"
                        src={profilePicUrl || defaultImg}
                        alt={`Profile of ${item.name}`}
                      />
                    </div>
                    <div className="column">{item.name}</div>
                    <div className="column">
                      {item.email_verified_at != null && "true"}{" "}
                      {item.email_verified_at == null && "false"}
                    </div>
                    <div className="column">{item.email}</div>
                    <div className="column">
                      {item.roles ? item.roles : "not-assigned"}
                    </div>
                    <div className="column">{item.domain}</div>
                    <div className="column">
                      <FormCheck
                        type="switch"
                        disabled
                        checked={item.is_active === 1 ? true : false}
                        label=""
                        onClick={() => {
                          console.log(item.id);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "right",
                        }}
                      />
                    </div>
                    <div className="column">
                      <Dropdown
                        show={menuOpen[index]}
                        onToggle={() => handleToggle(index)}
                      >
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          {t('actions')}
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                          className={`mobile-dropdown ${menuOpen[index] ? "visible" : ""
                            }`}
                        >
                          <PermissionGate permission={"users.changePassword"}>
                            <Dropdown.Item
                              onClick={() => {
                                setModalStatePassword(item.id);
                              }}
                            >
                              {t('changePassword')}
                            </Dropdown.Item>
                          </PermissionGate>
                          <PermissionGate permission={"users.changeRole"}>
                            <Dropdown.Item
                              onClick={() => {
                                setModalStateChangeRole(true);
                                setChangeRoleUserId(item.id);
                              }}
                            >
                              {t('changeRole')}
                            </Dropdown.Item>
                          </PermissionGate>
                          <PermissionGate permission={"users.statusChange"}>
                            <Dropdown.Item
                              onClick={() => {
                                setModalStateApproval(item.id);
                              }}
                            >
                              {item.is_active === 1
                                ? t('deactivateUser')
                                : t('activateUser')}
                            </Dropdown.Item>
                          </PermissionGate>
                          <PermissionGate permission={"users.verifyUser"}>
                            <Dropdown.Item
                              onClick={() => {
                                setModalStateVerify(item.id);
                              }}
                            >
                              {t('verifyUser')}
                            </Dropdown.Item>
                          </PermissionGate>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </InfiniteScroll>
        </div>
        <div className="spacer"></div>
      </div>
      <Modal show={modalStateChangeRole}>
        {
          <div className="">
            <h1>{t('changeRole')}</h1>
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
                      <option key="0" value="NULL">
                        {t('notAssigned')}
                      </option>
                      {roles.map((item) => {
                        return <option value={item.id}>{item.name}</option>;
                      })}
                    </select>
                  </div>

                  <div className="spacer"></div>
                  <div>
                    <div className="float-left">
                      <Button type="submit">{t('submit')}</Button>
                    </div>
                    <div className="float-right">
                      <Button
                        type="button"
                        onClick={() => setModalStateChangeRole(false)}
                      >
                        {t('close')}
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
