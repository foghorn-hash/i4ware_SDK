import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import {
  API_DEFAULT_LANGUAGE,
  ACCESS_TOKEN_NAME,
  API_BASE_URL,
} from "../../constants/apiConstants";
import request from "../../utils/Request";
import PermissionGate from "../../contexts/PermissionGate";
import LOADING from "../../tube-spinner.svg";
import VerifyNetvisorButton from "./VerifyNetvisorButton";
import { useTranslation } from "react-i18next";


const getDefaultSettings = () => {
  return {
    show_captcha: false,
    disable_registeration_from_others: false,
    disable_license_details: false,
    enable_netvisor: false,
  };
};

function Settings() {
  const [message, setMessage] = useState(null);
  const [setting, setSetting] = useState(getDefaultSettings);


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  useEffect(() => {
    request()
      .get("/api/settings")
      .then((res) => {
        if (res.status === 200) {
          const obj = getDefaultSettings();
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
        setMessage(t('settingUpdated'));

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
                onChange={(e) => {
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
                {t('showCaptcha')}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck2"
                onChange={(e) => {
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
                {t('disableRegistration')}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck3"
                onChange={(e) => {
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
                {t('disableLicenseDetails')}
              </label>
              <br />
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck4"
                onChange={(e) => {
                  settingUpdate({
                    setting_key: "enable_netvisor",
                    setting_value: e.target.checked,
                  });

                  setSetting({
                    ...setting,
                    enable_netvisor: e.target.checked,
                  });
                }}
                checked={setting.enable_netvisor}
              />
              <label className="form-check-label" htmlFor="defaultCheck4">
                {t('enableNetvisor')}
              </label>
            </div>
            <br />
            <VerifyNetvisorButton
              API_BASE_URL={API_BASE_URL}
              token={localStorage.getItem(ACCESS_TOKEN_NAME)}
            />
          </div>
        </PermissionGate>
      }
    </div>
  );
}

export default withRouter(Settings);
