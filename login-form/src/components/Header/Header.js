import React, { useState, useContext, useEffect } from "react";
import { NavLink, withRouter } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
import "./Header.css";
import PermissionGate from "../../contexts/PermissionGate";
// ES6 module syntax
import LocalizedStrings from 'react-localization';
import icon_menu from "../../icon_menu.png";
import { Link, useHistory, useLocation } from "react-router-dom";

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
    welcome: "Welcome",
    videoPhoto: "Video/Photo",
    chat: "Chat",
    revenueReport: "Revenues",
  },
  fi: {
    login: "Kirjaudu sisään",
    logout: "Kirjaudu ulos",
    myProfile: "Oma Profiili",
    stlViewer: "3D-katseluohjelma",
    manageUsers: "Käyttäjät",
    manageDomains: "Domainit",
    manageRoles: "Roolit",
    settings: "Asetukset",
    welcome: "Tervetuloa",
    videoPhoto: "Video/Kuva",
    chat: "Chatti",
    revenueReport: "Liikevaihtod",
  },
  sv: {
    login: "Logga in",
    logout: "Logga ut",
    myProfile: "Min Profil",
    stlViewer: "3D-visningsprogram",
    manageUsers: "Hantera användare",
    manageDomains: "Hantera domäner",
    manageRoles: "Hantera roller",
    settings: "Inställningar",
    welcome: "Välkommen",
    videoPhoto: "Video/Foto",
    chat: "Chatt",
    revenueReport: "Intäkter",
  }
});

function Header(props) {
  const { authState, authActions } = useContext(AuthContext);
  const [lang, setLang] = useState(API_DEFAULT_LANGUAGE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const history = useHistory();
  const location = useLocation();

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

  const renderLogout = () => {
    if (localization===null) {
      var language = API_DEFAULT_LANGUAGE;
    } else {
      var language = localization;
    }
  
    return (
      <div className="ml-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
        <select id="language-selector" className="language-selector" onChange={handleLocalization}>
          <option value="fi" selected={language === 'fi'}>Finnish</option>
          <option value="en" selected={language === 'en'}>English</option>
          <option value="sv" selected={language === 'sv'}>Swedish</option>
        </select>
  
        {authState.isLogged ? (
          <button className="btn btn-danger"  onClick={handleLogout}>
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
        { text: "manageUsers", link: "/manage-users", permission: "users.view" },
        { text: "manageDomains", link: "/manage-domains", permission: "domain.view" },
        { text: "manageRoles", link: "/manage-roles", permission: "roles.view" },
        { text: "settings", link: "/settings", permission: "settings.manage" }
      ].map((item, index) => {
        // console.log(item.text, strings[item.text]);
        return item.permission ? (
          <PermissionGate permission={item.permission} key={index}>
            <Nav.Link as={NavLink} to={item.link} onClick={handleDrawerClose}>
              {strings[item.text]}
            </Nav.Link>
          </PermissionGate>
        ) : (
          <Nav.Link as={NavLink} to={item.link} key={index} onClick={handleDrawerClose}>
              {strings[item.text]}
          </Nav.Link>
        );
        })}
        {authState.isLogged && (
          <Nav.Link className="btn btn-danger" style={{ color: 'white', marginTop: "40px"}} onClick={() => {
          handleLogout();
          handleDrawerClose();
        }}>
          {strings.logout}
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
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Button
                  variant="outline-secondary"
                  onClick={handleDrawerOpen}
                  style={{ marginRight: "40px" }}
                >
                  <img src={icon_menu} style={{width: '30px'}} alt="menu icon" />
                </Button>
                {renderLogout(localization)}  
              </div>
                <Offcanvas style={{ width: "220px"}} show={mobileMenuOpen} onHide={handleDrawerClose}>
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{strings.welcome}</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>{drawerContent}</Offcanvas.Body>
                </Offcanvas>
            
              </div>
        ) : (
         <>
            <Nav
             className={`me-auto my-2 my-lg-0 menu ${mobileMenuOpen ? 'mobile-menu open' : 'menu'}`}
              style={{ maxHeight: "100px"}}
              navbarScroll
            >
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/my-profile"
                onClick={() => setMobileMenuOpen(false)}>{strings.myProfile}</NavLink>
              )}
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/revenue-report"  
                onClick={() => setMobileMenuOpen(false)}>{strings.revenueReport}</NavLink>
              )}
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/stl-viewer"  
                onClick={() => setMobileMenuOpen(false)}>{strings.stlViewer}</NavLink>
              )}
              {authState.isLogged && (
                <NavLink className="Header-nav-link" to="/video-photo"
                onClick={() => setMobileMenuOpen(false)}>{strings.videoPhoto}</NavLink>
              )}
              {authState.isLogged && (
                <NavLink className="Header-nav-link" 
                onClick={() => setMobileMenuOpen(false)} to="/pusher-chat">{strings.chat}</NavLink>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"users.view"}>
                  <NavLink className="Header-nav-link" 
                   onClick={() => setMobileMenuOpen(false)}to="/manage-users">{strings.manageUsers}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"domain.view"}>
                  <NavLink className="Header-nav-link" 
                   onClick={() => setMobileMenuOpen(false)}to="/manage-domains">{strings.manageDomains}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"roles.view"}>
                  <NavLink className="Header-nav-link" 
                   onClick={() => setMobileMenuOpen(false)}to="/manage-roles">{strings.manageRoles}</NavLink>
                </PermissionGate>
              )}
              {authState.isLogged && (
                <PermissionGate permission={"settings.manage"}>
                  <NavLink className="Header-nav-link" 
                   onClick={() => setMobileMenuOpen(false)}to="/settings">{strings.settings}</NavLink>
                </PermissionGate>
              )}
            </Nav>
            {renderLogout(localization)}
          </>
        )}
        </Container>
      </Navbar>
    </div>
  );
}
export default withRouter(Header);