import React, {useState} from 'react';
import axios from 'axios';
import './EmailVerification.css';
import {API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE} from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";
import VerificationComponent from '../../components/VerificationComponent/VerificationComponent';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
      emailVerification: "Email Verification",
      goToLogin: "Go to Login?",
      loginHere: "Login here"
    },
    fi: {
      emailVerification: "Sähköpostin Varmistus",
      goToLogin: "Siirry kirjautumaan?",
      loginHere: "Kirjaudu tästä"
    },
    se: {
      emailVerification: "E-postverifiering",
      goToLogin: "Gå till inloggning?",
      loginHere: "Logga in här"
    }
  });

function EmailVerification(props) {
    const [state , setState] = useState({
		successMessage: null
    });
    const handleChange = (e) => {
        const {id , value} = e.target   
        setState(prevState => ({
            ...prevState,
            [id] : value
        }))
    };

    var query = window.location.search.substring(1);
    var urlParams = new URLSearchParams(query);
    var localization = urlParams.get('lang');
  
    if (localization===null) {
      strings.setLanguage(API_DEFAULT_LANGUAGE);
    } else {
      strings.setLanguage(localization);
    }
	
    const redirectToLogin = () => {
        props.updateTitle('Login')
        props.history.push('/login'); 
    }
	props.updateTitle('Email Verification');

    return(
        <div className="d-flex justify-content-center">
            <div className="animated-card-verification">
                <div className="card col-12 col-lg-4 verification-card mt-2 hv-center">
                    <VerificationComponent />
                    <div className="mt-2">
                        <span className="account-question">{strings.goToLogin}</span>
                        <span className="verificationText" onClick={() => redirectToLogin()}>{strings.loginHere}</span> 
                    </div>
                </div>
            </div>
        </div>
    )
};

export default withRouter(EmailVerification);