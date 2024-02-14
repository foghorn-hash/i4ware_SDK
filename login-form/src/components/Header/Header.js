import React, {useState} from "react";
import { Link, NavLink, Redirect, withRouter } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import { useContext } from "react";
import { useEffect } from "react";
import "./Header.css";
import PermissionGate from "../../contexts/PermissionGate";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    login: "Login",
    logout: "Logout",
    myProfile: "My Profile",
    stlViewer: "3D Viewer",
    manageUsers: "Manage Users",
    manageDomains: "Manage Domains",
    manageRoles: "Manage Roles",
    settings: "Settings",
    welcome: "Welcome"
  },
  fi: {
    login: "Kirjaudu sisään",
    logout: "Kirjaudu ulos",
    myProfile: "Oma Profiili",
    stlViewer: "3D-katseluohjelma",
    manageUsers: "Käyttäjien hallinta",
    manageDomains: "Domainien hallinta",
    manageRoles: "Roolien hallinta",
    settings: "Asetukset",
    welcome: "Tervetuloa"
  }
});

function Header(props) {
  const { authState, authActions } = useContext(AuthContext);
  const [lang, setLang] = useState(API_DEFAULT_LANGUAGE);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization===null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

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

  function renderLogout(localization) {
    const handleLogout = () => {
      axios
        .get(API_BASE_URL + "/api/users/logout", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        })
        .then(function(response) {
          authActions.authStateChanged({
            type: AUTH_STATE_CHANGED,
            payload: {
              user: null,
              token: null,
              isLogged: false,
            },
          });
        })
        .catch(function(error) {
          console.log(error);
        });
      localStorage.removeItem(ACCESS_TOKEN_NAME);
      props.history.push("/login");
    };
  
    const handleLocalization = () => {
      const e = document.getElementById("language-selector");
      const value = e.value;
      const currentHash = window.location.hash;
    
      // Check if there's already a language parameter in the URL
      const hasLangParam = window.location.search.includes("lang=");
    
      // Build the new URL with the updated language parameter
      let newUrl;
      if (hasLangParam) {
        // Replace the existing language parameter value
        newUrl = window.location.search.replace(/lang=[^&]*/, "lang=" + value);
      } else {
        // Add the new language parameter
        newUrl = window.location.search + (window.location.search ? "&" : "?") + "lang=" + value;
      }
    
      // Combine the new URL with the current hash
      const finalUrl = newUrl + currentHash;
    
      // Update the window location
      window.location.href = finalUrl;
    };

    if (localization===null) {
      var language = API_DEFAULT_LANGUAGE;
    } else {
      var language = localization;
    }
  
    return (
      <div className="ml-auto">
        <select id="language-selector" className="language-selector" onChange={handleLocalization}>
          <option value="fi" selected={language === 'fi'}>Finnish</option>
          <option value="en" selected={language === 'en'}>English</option>
        </select>
  
        {authState.isLogged ? (
          <button className="btn btn-danger" onClick={handleLogout}>
            {strings.logout}
          </button>
        ) : (
          <button
            className="Header-login-button btn btn-info"
            onClick={() => {
              props.history.push("/login");
            }}
          >
            {strings.login}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="Header">
      <Navbar bg="transparent" expand="lg">
        <Container fluid>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0 menu"
              style={{ maxHeight: "100px" }}
              navbarScroll
            >
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/my-profile">{strings.myProfile}</NavLink>
              )}
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/stl-viewer">{strings.stlViewer}</NavLink>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"users.view"}>
                  <NavLink className="Header-nav-link" to="/manage-users">{strings.manageUsers}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"domain.view"}>
                  <NavLink className="Header-nav-link" to="/manage-domains">{strings.manageDomains}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"roles.view"}>
                  <NavLink className="Header-nav-link" to="/manage-roles">{strings.manageRoles}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"settings.manage"}>
                  <NavLink className="Header-nav-link" to="/settings">{strings.settings}</NavLink>
                </PermissionGate>
              )}
            </Nav>
            {renderLogout(localization)}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
export default withRouter(Header);