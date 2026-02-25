import React, { useState, useEffect, useRef } from "react";
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
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import TextInput, { PassWordInput } from "./../common/TextInput";
import PermissionGate from "../../contexts/PermissionGate";
import { FormCheck, Pagination } from "react-bootstrap";
import ChangePassword from "./ChangePassword";
import LOADING from "../../tube-spinner.svg";
import DefaultMaleImage from "../../male-default-profile-picture.png";
import DefaultFemaleImage from "../../female-default-profile-picture.png";
import axios from "axios";
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

const USERS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 350;

function ManageAdmin() {


  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // What the user is typing — updates instantly so the input feels responsive
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // Debounced values actually sent to the API
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

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
  const [menuOpen, setMenuOpen] = useState([]);

  const totalPages = Math.max(1, Math.ceil(total / USERS_PER_PAGE));
  const hasActiveSearch = debouncedName !== "" || debouncedEmail !== "";

  //  Debounce name 
  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(searchName.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchName]);

  //  Debounce email 
  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(searchEmail.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchEmail]);

  // ── When search terms change, snap back to page 1 ─────────────
  // This runs BEFORE the fetch effect so page is already 1 when fetch fires
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedName, debouncedEmail]);

  // ── Fetch whenever page or debounced search terms change ──────
  useEffect(() => {
    fetchUsers(page, debouncedName, debouncedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedName, debouncedEmail]);

  const fetchUsers = async (pageNumber, name, email) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({ page: pageNumber, per_page: USERS_PER_PAGE });
      if (name) params.append("name", name);
      if (email) params.append("email", email);

      const response = await axios.get(
        `${API_BASE_URL}/api/manage/users?${params.toString()}`,
        { headers: { Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME) } }
      );

      const responseData = response.data;
      // Handle both plain array and { data, total } envelope
      if (Array.isArray(responseData)) {
        setUsers(responseData);
        // No total provided — estimate from current page size
        setTotal(responseData.length < USERS_PER_PAGE
          ? (page - 1) * USERS_PER_PAGE + responseData.length
          : page * USERS_PER_PAGE + 1
        );
      } else {
        setUsers(responseData.data ?? []);
        setTotal(responseData.total ?? 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsers = () => fetchUsers(page, debouncedName, debouncedEmail);

  const clearSearch = () => {
    setSearchName("");
    setSearchEmail("");
    // Debounced values will follow via useEffect
  };

  const handleToggle = (index) => {
    setMenuOpen((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
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
      } catch (error) { console.error(error); }
    };
    const fetchAllRoles = async () => {
      try {
        const res = await request().get("/api/manage/roles/all");
        setRoles(res.data);
      } catch (error) { console.error(error); }
    };
    fetchRolesForAdd();
    fetchAllRoles();
  }, []);

  //  Mutation handlers 
  const changeRole = (values) => {
    request()
      .post("/api/manage/roles/setRole", { ...values, userid: changeRoleUserId })
      .then(() => { setModalStateChangeRole(false); refreshUsers(); });
  };

  const userStatusHandler = () => {
    request()
      .post("/api/manage/users/change-status", { id: modalStateApproval })
      .then(() => { setModalStateApproval(null); refreshUsers(); });
  };

  const userVerifyHandler = () => {
    request()
      .post("/api/manage/users/verify", { id: modalStateVerfiy })
      .then(() => { setModalStateVerify(null); refreshUsers(); });
  };

  const userPasswordHandler = (values) => {
    request()
      .post("/api/manage/users/change-password", { id: modalStatePassword, ...values })
      .then(() => { setModalStatePassword(null); refreshUsers(); });
  };

  //  Pagination 
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const renderPaginationItems = () => {
    const items = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>
      );
      if (left > 2) items.push(<Pagination.Ellipsis key="left-ellipsis" disabled />);
    }

    for (let p = left; p <= right; p++) {
      items.push(
        <Pagination.Item key={p} active={p === page} onClick={() => handlePageChange(p)}>
          {p}
        </Pagination.Item>
      );
    }

    if (right < totalPages) {
      if (right < totalPages - 1)
        items.push(<Pagination.Ellipsis key="right-ellipsis" disabled />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <>
      { }
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
        <div>
          <h1>{strings.areYouSure}</h1>
          <div>{strings.wantToChangeUserStatus}</div>
          <div className="spacer"></div>
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
        </div>
      </ModalApproval>

      <ModalVerify show={modalStateVerfiy !== null}>
        <div>
          <h1>{strings.areYouSure}</h1>
          <div>{strings.wantToVerifyUser}</div>
          <div className="spacer"></div>
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
        </div>
      </ModalVerify>

      <ModalActivate show={modalStateActivate}>
        <div>
          <h1>{strings.areYouSure}</h1>
          <div>{strings.wantToActivateUser}</div>
          <div className="spacer"></div>
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
        </div>
      </ModalActivate>

      <ModalPasswordChange show={modalStatePassword}>
        <ChangePassword
          closeModel={() => setModalStatePassword(null)}
          onSubmit={(values) => userPasswordHandler(values)}
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

      { }
      <PermissionGate permission={"users.addUser"}>
        <div className="button-bar">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalState(true)}
            disabled={!rolesforusers || rolesforusers.length === 0}
          >
            {strings.addUser}
          </Button>
        </div>
      </PermissionGate>

      {/* Search bar */}
      <div className="d-flex align-items-center gap-2 mt-3 mb-2 flex-wrap">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "240px" }}
          placeholder={strings.searchByName}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          aria-label="Search by name"
        />
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "280px" }}
          placeholder={strings.searchByEmail}
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          aria-label="Search by email"
        />
        {hasActiveSearch && (
          <Button variant="outline-secondary" size="sm" onClick={clearSearch}>
            {strings.clearSearch}
          </Button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="mt-2">
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
          {isLoading ? (
            <div className="loading-screen">
              <img src={LOADING} alt="Loading..." />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted">{strings.noUsersFound}</div>
          ) : (
            users.map((item, index) => {
              const profilePicUrl = item.profile_picture_path
                ? API_BASE_URL +
                item.profile_picture_path.replaceAll(
                  "public/uploads",
                  "/storage/uploads"
                )
                : null;
              const defaultImg = item.gender === "male" ? DefaultMaleImage : DefaultFemaleImage;
              const rowNumber = (page - 1) * USERS_PER_PAGE + index + 1;

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

                  <div className="table-row">
                    <div className="column">{rowNumber}</div>
                    <div className="column">{item.id}</div>
                    <div className="column">
                      <img
                        className="max-height-profile-pic-manage-users"
                        src={profilePicUrl || defaultImg}
                        alt={`Profile of ${item.name}`}
                      />
                    </div>
                    <div className="column">{item.name}</div>
                    <div className="column">{item.email_verified_at != null ? "true" : "false"}</div>
                    <div className="column">{item.email}</div>
                    <div className="column">{item.roles ? item.roles : "not-assigned"}</div>
                    <div className="column">{item.domain}</div>
                    <div className="column">
                      <FormCheck
                        type="switch"
                        disabled
                        checked={item.is_active === 1}
                        label=""
                        style={{ display: "flex", alignItems: "center", justifyContent: "right" }}
                      />
                    </div>
                    <div className="column">
                      <Dropdown show={menuOpen[index]} onToggle={() => handleToggle(index)}>
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
            })
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
              {renderPaginationItems()}
              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        )}

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
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </>
  );
}

export default ManageAdmin;