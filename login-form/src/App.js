import React, {useEffect, useState, useContext} from "react";
import { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { API_DEFAULT_LANGUAGE } from "./constants/apiConstants";
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
import {AuthProvider, AUTH_STATE_CHANGED } from "./contexts/auth.contexts";
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
import Timeshhet from "./components/Timesheet/Timesheet";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    license: "License",
    copyright: 'Copyright © 2022-present i4ware Software',
    permission: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
    conditions: 'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
    warranty: 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
  },
  fi: {
    license: "Lisenssi",
    copyright: "Tekijänoikeus © 2022–nykyhetki i4ware Software",
    permission: 'Täten myönnetään lupa maksutta kenelle tahansa, joka hankkii tämän ohjelmiston ja siihen liittyvät dokumentaatiotiedostot (jäljempänä "Ohjelmisto"), käyttää Ohjelmistoa ilman rajoituksia, mukaan lukien oikeudet käyttää, kopioida, muokata, yhdistää, julkaista, levittää, alilisensoida ja/tai myydä Ohjelmiston kopioita sekä antaa Ohjelmiston saaneille henkilöille lupa tehdä näin, edellyttäen että seuraavat ehdot täyttyvät:', 
    conditions: 'Yllä oleva tekijänoikeusilmoitus ja tämä lupailmoitus on sisällytettävä kaikkiin Ohjelmiston kopioihin tai olennaisiin osiin siitä.',
    warranty: 'OHJELMISTO TARJOTAAN "SELLAISENAAN", ILMAN MINKÄÄNLAISTA TAKUUTA, OLIVAT NE SITTEN NIMELLISIÄ TAI OLETETTUJA, MUKAAN LUKIEN, MUTTA EI RAJOITTUEN, KAUPALLISUUSTAKUUT, TIETTYYN TARKOITUKSEEN SOPIVUUSTAKUUT JA LOUKKAAMATTOMUUSTAKUUT. MISSÄÄN TAPAUKSESSA TEKIJÄT TAI TEKIJÄNOIKEUDEN HALTIJAT EIVÄT OLE VASTUUSSA MISTÄÄN VAATEISTA, VAHINGOISTA TAI MUUSTA VASTUUSTA, OLI KYSE SOPIMUKSESTA, TUOTTAMUKSESTA TAI MUUSTA SEIKASTA, JOKA JOHTUU OHJELMISTON TAI SEN KÄYTÖN TAI MUUN TOIMINNAN YHTEYDESSÄ TAI SIITÄ JOHTUEN.',
  },
  sv: {
    license: "Licens",
    copyright: "Upphovsrätt © 2022–nutid i4ware Software",
    permission: 'Härmed ges tillstånd, kostnadsfritt, till varje person som erhåller en kopia av denna programvara och tillhörande dokumentationsfiler (nedan kallad "Programvara"), att använda Programvaran utan begränsningar, inklusive rätten att använda, kopiera, modifiera, sammanfoga, publicera, distribuera, underlicensiera och/eller sälja kopior av Programvaran samt att ge personer till vilka Programvaran tillhandahålls tillstånd att göra detsamma, under förutsättning att följande villkor uppfylls:',
    conditions: 'Ovanstående upphovsrättsmeddelande och detta tillståndsmeddelande ska inkluderas i alla kopior eller väsentliga delar av Programvaran.', 
    warranty: 'PROGRAMVARAN TILLHANDAHÅLLS "I BEFINTLIGT SKICK", UTAN GARANTI AV NÅGOT SLAG, VARE SIG UTTRYCKT ELLER UNDERFÖRSTÅDD, INKLUSIVE MEN INTE BEGRÄNSAT TILL GARANTIER OM SÄLJBARHET, ANPASSNING FÖR ETT VISST SYFTE OCH OFRÄNKBARHET. UNDER INGA OMSTÄNDIGHETER SKA UPPHOVSRÄTTSHAVARE ELLER UPPHOVSPERSONER VARA ANSVARIGA FÖR NÅGRA KRAV, SKADOR ELLER ANNAN ANSVARSSKYLDIGHET, OAVSETT OM DET GÄLLER KONTRAKT, SKULD, ELLER ANNAT, SOM UPPSTÅR FRÅN, UTANFÖR ELLER I SAMBAND MED PROGRAMVARAN ELLER ANVÄNDNINGEN ELLER ANDRA ÅTGÄRDER MED PROGRAMVARAN.',
  }
});

function App() {
  const [title, updateTitle] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [show, setShow] = useState(false);
  const [setting, setSetting] = React.useState({
      disable_license_details: false
    });
  

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const updateErrorMessage = (message)=>{
    setErrorMessage(message)
  }

  const [lang, setLang] = useState(API_DEFAULT_LANGUAGE);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization===null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(()=>{
      // setLoading(true);
      request()
        .get("/api/settings")
        .then(res => {
          if(res.status == 200 ){
            // setLoading(false);
              const obj = {};
              for (let i = 0; i < res.data.data.length; i++) {
                  const element = res.data.data[i];
                  if(element.setting_value == "1"){
                      obj[element.setting_key] = true 
                  }
                  if(element.setting_value == "0"){
                      obj[element.setting_key] = false 
                  }
              }
              setSetting(obj);
          }
  
        })
    },[]);

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
        <a href="#/public"><img src={LOGO} alt="logo" className="App-logo" style={{width: '380px', height: '100%'
        }}/></a>
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
                  updateTile={updateTitle}
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
              <PrivateRoute path="/timesheet" component={Timeshhet} />
            </Switch>
          </Container>
        </AuthProvider>
        {!setting.disable_license_details &&
        <>
        <Offcanvas style={{ width: "350px"}} show={show} onHide={handleClose} placement="end">
          <Offcanvas.Header>
            <Button variant="close" aria-label="Close" onClick={handleClose}></Button>
            <Offcanvas.Title>{strings.license}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <p>{strings.copyright}</p>
            <p>{strings.permission}</p>
            <p>{strings.conditions}</p>
            <p>{strings.warranty}</p>
          </Offcanvas.Body>
        </Offcanvas>
        <Button className="App-license-button" variant="primary" onClick={handleShow}>
          {strings.license}
        </Button>
        </>
        }
      </div>
      </ErrorBoundary>
    </Router>
    
  );
}

export default App;