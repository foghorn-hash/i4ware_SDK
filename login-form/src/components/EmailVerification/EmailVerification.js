import React, {useState} from 'react';
import axios from 'axios';
import './EmailVerification.css';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";
import VerificationComponent from '../../components/VerificationComponent/VerificationComponent';

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
                        <span className="account-question">Go to Login? </span>
                        <span className="verificationText" onClick={() => redirectToLogin()}>Login here</span> 
                    </div>
                </div>
            </div>
        </div>
    )
};

export default withRouter(EmailVerification);