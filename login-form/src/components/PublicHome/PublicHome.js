import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import 'video-react/dist/video-react.css';
import "./PublicHome.css";
import { Player } from 'video-react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import LOGO_COPY from "../../PoweredBy_TES_DarkWhite.png";

function PublicHome() {

  return (
    <div className="PublicHomePlayer">
        <video
            id="my-player"
            class="video-js PublicHomePlayer"
            controls
            preload="auto"
            autoplay="true"
            loop="true"
            responsive="true"
            fill="true"
            disableProgress="true"
            controls=""
            data-setup='{}'>
        <source src="../../blexsus-basic.mp4" type="video/mp4"></source>
        <p class="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            web browser that
            <a href="https://videojs.com/html5-video-support/" target="_blank">
            supports HTML5 video
            </a>
        </p>
      </video>
      <div className="App-copyright">
        <img src={LOGO_COPY} alt="logo" className="App-logo-copyright" /> | i4ware - SDK | Copyright © i4ware Software 2004-2023, all rights reserved. | Version 1.0.0
      </div>
    </div>
  );
}

export default withRouter(PublicHome);