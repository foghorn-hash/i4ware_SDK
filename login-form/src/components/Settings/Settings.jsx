import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {ACCESS_TOKEN_NAME, API_BASE_URL, API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import axios from "axios";
import UserDataComponent from "../../components/UserDataComponent/UserDataComponent";
import request from "../../utils/Request";
import {AuthContext} from "../../contexts/auth.contexts";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    showCaptcha: "Show Captcha in Register Form",
    disableRegistration: "Disable registration from other domains than domain owner",
    settingUpdated: "Setting Updated successfully",
  },
  fi: {
    showCaptcha: "Näytä Captcha rekisteröintilomakkeessa",
    disableRegistration: "Estä rekisteröinti muilta kuin domainin omistajilta",
    settingUpdated: "Asetukset päivitetty",
  }
});

function Settings() {
  const {authState, authActions} = React.useContext(AuthContext);
  const [message, setMessage] = React.useState(null);
  const [setting, setSetting] = React.useState({
    show_captcha: false
  });

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(()=>{
    request()
      .get("/api/settings")
      .then(res => {
        if(res.status == 200 ){
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

  const settingUpdate = data => {
    request()
      .post("/api/manage/updateSettings", data)
      .then(res => {
        setMessage(strings.settingUpdated);
        
        setTimeout(() => {
          setMessage(null);
        }, 2500);
      })
  };

  if (!setting) {
    return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  }

  return (
    <div className="mt-2">
	{<PermissionGate permission={"settings.manage"} >
      <div className="mt-5">
        {message && <div className="alert alert-success">{message}</div>}
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="defaultCheck1"
            onClick={e => {
              settingUpdate({
                setting_key: "show_captcha",
                setting_value: e.target.checked,
              });

              setSetting({
                ...setting,
                show_captcha: e.target.checked
              })
            }}
            checked={setting.show_captcha}
          />
          <label class="form-check-label" for="defaultCheck1">
            {strings.showCaptcha}
          </label>
          <br />
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="defaultCheck2"
            onClick={e => {
              settingUpdate({
                setting_key: "disable_registeration_from_others",
                setting_value: e.target.checked,
              });

              setSetting({
                ...setting,
                disable_registeration_from_others: e.target.checked
              })
            }}
            checked={setting.disable_registeration_from_others}
          />
          <label class="form-check-label" for="defaultCheck2">
            {strings.disableRegistration}
          </label>
        </div>
      </div>
      </PermissionGate>
	  }
    </div>
  );
}

export default withRouter(Settings);
