import React, {useState} from "react";
import { render } from "react-dom";
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
import AlertComponent from "./components/AlertComponent/AlertComponent";
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
import ErrorBoundary from "./contexts/ErrorBoundry";
import LOGO from "./52311-logo-transparent.png";


function App() {
  const [title, updateTitle] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const updateErrorMessage = (message)=>{
    setErrorMessage(message)
  }

  return (
    <Router>
      <ErrorBoundary
      fallbackRender =  {({error, resetErrorBoundary, componentStack}) => (
          <div>
          <h1>An error occurred: {error.message}</h1>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <div className="App-background"></div>
      <div className="App-logo-header">
        <a href="#/public"><img src={LOGO} alt="logo" className="App-logo" /></a>
      </div>
      <div className="App">
        <AuthProvider>
          <Container>
            {errorMessage && <Alert variant="danger" onClose={() => updateErrorMessage(false)} dismissible>
              {errorMessage}
            </Alert>}
            <Header title={"AA"} />
            <Switch>
              <Route path="/public">
                <PublicHome className="PublicHomePlayer" />
              </Route>
              <Route path="/register">
                <RegistrationForm
                  showError={updateErrorMessage}
                  updateTitle={updateTitle}
                />
              </Route>
              <Route path="/login">
                <LoginForm
                  showError={updateErrorMessage}
                  updateTitle={updateTitle}
                />
              </Route>
			        <Route path="/reset-password">
                <ResetPasswordForm
                  showError={updateErrorMessage}
                  updateTitle={updateTitle}
                />
              </Route>
			        <Route path="/submitresetpassword">
                <ShowResetPasswordForm
                  showError={updateErrorMessage}
                  updateTitle={updateTitle}
                />
              </Route>
              <Route path="/verifyemail">
                <EmailVerification
                  showError={updateErrorMessage}
                  updateTitle={updateTitle}
                />
              </Route>
              <PrivateRoute path="/home" component={Home} />
              <PrivateRoute path="/my-profile" component={MyProfile} />
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
              <PrivateRoute path="/Pusher-Chat" component={PusherChat} />
            </Switch>
          </Container>
        </AuthProvider>
      </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;