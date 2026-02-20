import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import "video-react/dist/video-react.css";
import "./PublicHome.css";
import { Player } from "video-react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import LOGO_COPY from "../../PoweredBy_TES_DarkWhite.png";
import { useTranslation } from "react-i18next";


function PublicHome() {
  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  return (
    <div className="PublicHomePlayer">
      <video
        id="my-player"
        className="video-js PublicHomePlayer"
        preload="auto"
        autoplay="true"
        loop="true"
        responsive="true"
        fill="true"
        disableProgress="true"
        controls=""
        data-setup="{}"
      >
        <source src="../../blexsus-basic.mp4" type="video/mp4"></source>
        <p className="vjs-no-js">
          {t('video')}
          {t('web')}
          <a href="https://videojs.com/html5-video-support/" target="_blank">
            {t('support')}
          </a>
        </p>
      </video>
      <div className="App-copyright">
        <img src={LOGO_COPY} alt="logo" className="App-logo-copyright" />{" "}
        {t('copyright')}
      </div>
    </div>
  );
}

// export default withRouter(PublicHome);
export default withRouter(PublicHome);
