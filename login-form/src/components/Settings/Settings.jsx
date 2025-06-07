import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import request from "../../utils/Request";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import Button from "react-bootstrap/Button";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    showCaptcha: "Show Captcha in Register Form",
    disableRegistration:
      "Disable registration from other domains than domain owner",
    settingUpdated: "Setting Updated successfully",
    disableLicenseDetails: "Disable Lisense Details",
    enableNetvisor: "Enable Netvisor",
  },
  fi: {
    showCaptcha: "Näytä Captcha rekisteröintilomakkeessa",
    disableRegistration: "Estä rekisteröinti muilta kuin domainin omistajilta",
    settingUpdated: "Asetukset päivitetty",
    disableLicenseDetails: "Deaktivoi lisenssitiedot",
    enableNetvisor: "Aktivoi Netvisor",
  },
  sv: {
    showCaptcha: "Visa Captcha i registreringsformuläret",
    disableRegistration: "Blockera registrering för andra än domänägare",
    settingUpdated: "Inställningar uppdaterade",
    disableLicenseDetails: "Avaktivera licensinformation",
    enableNetvisor: "Aktivera Netvisor",
  },
});

function Settings() {
  const [message, setMessage] = React.useState(null);
  const [setting, setSetting] = React.useState({
    show_captcha: false,
  });

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get("lang");

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(() => {
    request()
      .get("/api/settings")
      .then((res) => {
        if (res.status === 200) {
          const obj = {};
          for (let i = 0; i < res.data.data.length; i++) {
            const element = res.data.data[i];
            if (element.setting_value === "1") {
              obj[element.setting_key] = true;
            }
            if (element.setting_value === "0") {
              obj[element.setting_key] = false;
            }
          }
          setSetting(obj);
        }
      });
  }, []);

  const settingUpdate = (data) => {
    request()
      .post("/api/manage/updateSettings", data)
      .then((res) => {
        setMessage(strings.settingUpdated);

        setTimeout(() => {
          setMessage(null);
        }, 2500);
      });
  };

  if (!setting) {
    return (
      <div className="loading-screen">
        <img src={LOADING} alt="Loading..." />
      </div>
    );
  }

  return (
    <div className="mt-2">
      {
        <PermissionGate permission={"settings.manage"}>
          <div className="mt-5">
            {message && <div className="alert alert-success">{message}</div>}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck1"
                onClick={(e) => {
                  settingUpdate({
                    setting_key: "show_captcha",
                    setting_value: e.target.checked,
                  });

                  setSetting({
                    ...setting,
                    show_captcha: e.target.checked,
                  });
                }}
                checked={setting.show_captcha}
              />
              <label className="form-check-label" htmlFor="defaultCheck1">
                {strings.showCaptcha}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck2"
                onClick={(e) => {
                  settingUpdate({
                    setting_key: "disable_registeration_from_others",
                    setting_value: e.target.checked,
                  });

                  setSetting({
                    ...setting,
                    disable_registeration_from_others: e.target.checked,
                  });
                }}
                checked={setting.disable_registeration_from_others}
              />
              <label className="form-check-label" htmlFor="defaultCheck2">
                {strings.disableRegistration}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck3"
                onClick={(e) => {
                  settingUpdate({
                    setting_key: "disable_license_details",
                    setting_value: e.target.checked,
                  });

                  setSetting({
                    ...setting,
                    disable_license_details: e.target.checked,
                  });
                }}
                checked={setting.disable_license_details}
              />
              <label className="form-check-label" htmlFor="defaultCheck3">
                {strings.disableLicenseDetails}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck4"
                onClick={(e) => {
                  settingUpdate({
                    setting_key: "ensable_netvisor",
                    setting_value: e.target.checked,
                  });

                  setSetting({
                    ...setting,
                    ensable_netvisor: e.target.checked,
                  });
                }}
                checked={setting.ensable_netvisor}
              />
              <label className="form-check-label" htmlFor="defaultCheck4">
                {strings.enableNetvisor}
              </label>
            </div>
            <br />
            <Button>Verrify Netvisor</Button>
          </div>
        </PermissionGate>
      }
    </div>
  );
}

export default withRouter(Settings);
