import React, {useEffect, useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Header from "./components/Header/Header";
import LoginForm from "./components/LoginForm/LoginForm";
import ResetPasswordForm from "./components/ResetPasswordForm/ResetPasswordForm";
import ShowResetPasswordForm from "./components/ShowResetPasswordForm/ShowResetPasswordForm";
import EmailVerification from "./components/EmailVerification/EmailVerification";
import RegistrationForm from "./components/RegistrationForm/RegistrationForm";
import Home from "./components/Home/Home";
import PublicHome from "./components/PublicHome/PublicHome";
import PrivateRoute from "./utils/PrivateRoute";
import {HashRouter as Router, Switch, Route} from "react-router-dom";
import {AuthProvider} from "./contexts/auth.contexts";
import {Container,Alert} from "react-bootstrap";
import ManageAdmin from "./components/ManageAdmin/ManageUsers";
import MyProfile from "./components/MyProfile/MyProfile";
import ManageDomain from "./components/ManageDomain/ManageDomain";
import ManageDomainForm from "./components/ManageDomain/ManageDomainForm";
import Settings from "./components/Settings/Settings";
import ManageRoles from "./components/ManageRoles/ManageRoles";
import RoleForm from "./components/ManageRoles/RoleForm";
import STLViewerComponent from "./components/STLViewerComponent/STLViewerComponent";
import VideoPhoto from "./components/VideoPhoto/VideoPhoto";
import PusherChat from "./components/PusherChat/PusherChat";
import Charts from "./components/RevenueCharts/Charts";
import ErrorBoundary from "./contexts/ErrorBoundry";
import LOGO from "./52311-logo-transparent.png";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import request from "./utils/Request";
import Timesheet from "./components/Timesheet/Timesheet";
import { useTranslation } from 'react-i18next';

function App() {
  const [title, updateTitle] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [show, setShow] = useState(false);
  const [setting, setSetting] = React.useState({
    disable_license_details: false
  });

  const { t } = useTranslation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const updateErrorMessage = (message) => {
    setErrorMessage(message);
  };

  useEffect(() => {
    request()
      .get("/api/settings")
      .then(res => {
        if (res && res.status === 200) {
          const obj = {};
          for (let i = 0; i < res.data.data.length; i++) {
            const element = res.data.data[i];
            if (element.setting_value === "1") obj[element.setting_key] = true;
            if (element.setting_value === "0") obj[element.setting_key] = false;
          }
          setSetting(obj);
        }
      })
      .catch(error => {
        console.error("Settings API error:", error);
        setSetting({
          show_captcha: false,
          disable_registertion_from_others: false
        });
      });
  }, []);

  return (
    <Router>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div>
            <h1>An error occurred: {error.message}</h1>
            <button onClick={resetErrorBoundary}>Try again</button>
          </div>
        )}
      >
        <div className="App-background"></div>
        <div className="App-logo-header">
          <a href="#/public">
            <img src={LOGO} alt="logo" className="App-logo" style={{ width: '380px', height: '100%' }} />
          </a>
        </div>
        <div className="App">
          <AuthProvider>
            <Container>
              {errorMessage && (
                <Alert variant="danger" onClose={() => updateErrorMessage(false)} dismissible>
                  {errorMessage}
                </Alert>
              )}
              <Header title={"AA"} />
              <Switch>
                <Route path="/public">
                  <PublicHome className="PublicHomePlayer" />
                </Route>
                <Route path="/register">
                  <RegistrationForm showError={updateErrorMessage} updateTitle={updateTitle} />
                </Route>
                <Route path="/login">
                  <LoginForm showError={updateErrorMessage} updateTitle={updateTitle} />
                </Route>
                <Route path="/reset-password">
                  <ResetPasswordForm showError={updateErrorMessage} updateTile={updateTitle} />
                </Route>
                <Route path="/submitresetpassword">
                  <ShowResetPasswordForm showError={updateErrorMessage} updateTitle={updateTitle} />
                </Route>
                <Route path="/verifyemail">
                  <EmailVerification showError={updateErrorMessage} updateTitle={updateTitle} />
                </Route>
                <PrivateRoute path="/home" component={Home} />
                <PrivateRoute path="/my-profile" component={MyProfile} />
                <PrivateRoute path="/revenue-report" component={Charts} />
                <PrivateRoute path="/manage-users" component={ManageAdmin} />
                <PrivateRoute path="/manage-domains/add" component={ManageDomainForm} />
                <PrivateRoute path="/manage-domains/edit" component={ManageDomainForm} />
                <PrivateRoute path="/manage-domains" component={ManageDomain} />
                <PrivateRoute path="/manage-roles/edit" component={RoleForm} />
                <PrivateRoute path="/manage-roles/add" component={RoleForm} />
                <PrivateRoute path="/manage-roles" component={ManageRoles} />
                <PrivateRoute path="/settings" component={Settings} />
                <PrivateRoute path="/stl-viewer" component={STLViewerComponent} />
                <PrivateRoute path="/video-photo" component={VideoPhoto} />
                <PrivateRoute path="/pusher-chat" component={PusherChat} />
                <PrivateRoute path="/timesheet" component={Timesheet} />
              </Switch>
            </Container>
          </AuthProvider>

          {!setting.disable_license_details && (
            <>
              <Offcanvas style={{ width: "350px" }} show={show} onHide={handleClose} placement="end">
                <Offcanvas.Header>
                  <Button variant="close" aria-label="Close" onClick={handleClose}></Button>
                  <Offcanvas.Title>{t('license')}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <p>{t('copyright')}</p>
                  <p>{t('permission')}</p>
                  <p>{t('conditions')}</p>
                  <p>{t('warranty')}</p>
                </Offcanvas.Body>
              </Offcanvas>
              <Button className="App-license-button" variant="primary" onClick={handleShow}>
                {t('license')}
              </Button>
            </>
          )}
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;