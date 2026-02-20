import React, { useState, useContext, useEffect } from "react";
import { NavLink, withRouter } from "react-router-dom";
import axios from "axios";
import {
  API_BASE_URL,
  API_DEFAULT_LANGUAGE,
  ACCESS_TOKEN_NAME,
} from "../../constants/apiConstants";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import "./Header.css";
import PermissionGate from "../../contexts/PermissionGate";
import icon_menu from "../../icon_menu.png";
import { useTranslation } from 'react-i18next';

function Header(props) {
  const { authState, authActions } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const { t, i18n } = useTranslation();

  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  let title = capitalize(
    props.location.pathname.substring(1, props.location.pathname.length)
  );
  if (props.location.pathname === "/") {
    title = "Welcome";
  }

  const handleLogout = () => {
    axios
      .get(API_BASE_URL + "/api/users/logout", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      })
      .then(function (response) {
        authActions.authStateChanged({
          type: AUTH_STATE_CHANGED,
          payload: {
            user: null,
            token: null,
            isLogged: false,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    localStorage.removeItem(ACCESS_TOKEN_NAME);
    props.history.push("/login");
  };

  const handleLocalization = (e) => {
    const value = e.target.value;
    i18n.changeLanguage(value);
  };

  const renderLogout = () => {
    return (
      <div
        className="ml-auto"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <select
          id="language-selector"
          className="language-selector"
          value={i18n.language}
          onChange={handleLocalization}
        >
          <option value="fi">Finnish</option>
          <option value="en">English</option>
          <option value="sv">Swedish</option>
        </select>

        {authState.isLogged ? (
          <button className="btn btn-danger" onClick={handleLogout}>
            {t('logout')}
          </button>
        ) : (
          <button
            className="Header-login-button btn btn-info"
            onClick={() => {
              props.history.push("/login");
            }}
          >
            {t('login')}
          </button>
        )}
      </div>
    );
  };

  const handleDrawerOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileMenuOpen(false);
  };

  const drawerContent = (
    <Nav className="flex-column">
      {[
        { text: "myProfile", link: "/my-profile" },
        { text: "revenueReport", link: "/revenue-report" },
        { text: "stlViewer", link: "/stl-viewer" },
        { text: "videoPhoto", link: "/video-photo" },
        { text: "chat", link: "/pusher-chat" },
        { text: "timesheet", link: "/timesheet" },

        {
          text: "manageUsers",
          link: "/manage-users",
          permission: "users.view",
        },
        {
          text: "manageDomains",
          link: "/manage-domains",
          permission: "domain.view",
        },
        {
          text: "manageRoles",
          link: "/manage-roles",
          permission: "roles.view",
        },
        { text: "settings", link: "/settings", permission: "settings.manage" },
      ].map((item, index) => {
        return item.permission ? (
          <PermissionGate permission={item.permission} key={index}>
            <Nav.Link as={NavLink} to={item.link} onClick={handleDrawerClose}>
              {t(item.text)}
            </Nav.Link>
          </PermissionGate>
        ) : (
          <Nav.Link
            as={NavLink}
            to={item.link}
            key={index}
            onClick={handleDrawerClose}
          >
            {t(item.text)}
          </Nav.Link>
        );
      })}
      {authState.isLogged && (
        <Nav.Link
          className="btn btn-danger"
          style={{ color: "white", marginTop: "40px" }}
          onClick={() => {
            handleLogout();
            handleDrawerClose();
          }}
        >
          {t('logout')}
        </Nav.Link>
      )}
    </Nav>
  );

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 1000);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  return (
    <div className="Header">
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          {isMobileView && authState.isLogged ? (
            <div className="grow leftAlign">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Button
                  variant="outline-secondary"
                  onClick={handleDrawerOpen}
                  style={{ marginRight: "40px" }}
                >
                  <img
                    src={icon_menu}
                    style={{ width: "30px" }}
                    alt="menu icon"
                  />
                </Button>
                {renderLogout()}
              </div>
              <Offcanvas
                style={{ width: "220px" }}
                show={mobileMenuOpen}
                onHide={handleDrawerClose}
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>{t('welcome')}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>{drawerContent}</Offcanvas.Body>
              </Offcanvas>
            </div>
          ) : (
            <>
              <Nav
                className={`me-auto my-2 my-lg-0 menu ${mobileMenuOpen ? "mobile-menu open" : "menu"
                  }`}
                style={{ maxHeight: "100px" }}
                navbarScroll
              >
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    to="/my-profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('myProfile')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    to="/revenue-report"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('revenueReport')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    to="/stl-viewer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('stlViewer')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    to="/video-photo"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('videoPhoto')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                    to="/pusher-chat"
                  >
                    {t('chat')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <NavLink
                    className="Header-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                    to="/timesheet"
                  >
                    {t('timesheet')}
                  </NavLink>
                )}
                {authState.isLogged && (
                  <PermissionGate permission={"users.view"}>
                    <NavLink
                      className="Header-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                      to="/manage-users"
                    >
                      {t('manageUsers')}
                    </NavLink>
                  </PermissionGate>
                )}
                {authState.isLogged && (
                  <PermissionGate permission={"domain.view"}>
                    <NavLink
                      className="Header-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                      to="/manage-domains"
                    >
                      {t('manageDomains')}
                    </NavLink>
                  </PermissionGate>
                )}
                {authState.isLogged && (
                  <PermissionGate permission={"roles.view"}>
                    <NavLink
                      className="Header-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                      to="/manage-roles"
                    >
                      {t('manageRoles')}
                    </NavLink>
                  </PermissionGate>
                )}
                {authState.isLogged && (
                  <PermissionGate permission={"settings.manage"}>
                    <NavLink
                      className="Header-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                      to="/settings"
                    >
                      {t('settings')}
                    </NavLink>
                  </PermissionGate>
                )}
              </Nav>
              {renderLogout()}
            </>
          )}
        </Container>
      </Navbar>
    </div>
  );
}
export default withRouter(Header);