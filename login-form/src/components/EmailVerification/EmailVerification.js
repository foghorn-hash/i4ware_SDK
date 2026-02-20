import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmailVerification.css';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";
import VerificationComponent from '../../components/VerificationComponent/VerificationComponent';
import { useTranslation } from 'react-i18next';

function EmailVerification(props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({
    successMessage: null
  });
  const handleChange = (e) => {
    const { id, value } = e.target
    setState(prevState => ({
      ...prevState,
      [id]: value
    }))
  };

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);



  const redirectToLogin = () => {
    props.updateTitle('Login')
    props.history.push('/login');
  }



  return (
    <div className="d-flex justify-content-center">
      <div className="card col-12 col-lg-4 verification-card mt-2 hv-center">
        <VerificationComponent />
        <div className="mt-2">
          <span className="account-question">{t('goToLogin')}</span>
          <span className="verificationText" onClick={() => redirectToLogin()}>{t('loginHere')}</span>
        </div>
      </div>
    </div>
  )
};

export default withRouter(EmailVerification);