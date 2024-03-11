import React, {useState, useContext,useEffect} from "react";
import "./VideoPhoto.css";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { AuthContext, AUTH_STATE_CHANGED } from "../../contexts/auth.contexts";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
        videoPhoto: "Video/Photo",
    },
    fi: {
        videoPhoto: "Video/Kuva",
    }
});

function VideoPhoto(props) {
    const { authState, authActions } = useContext(AuthContext);
    
    return (
        <div>
            <h3>{strings.videoPhoto}</h3>
        </div>
    );
}

export default withRouter(VideoPhoto);