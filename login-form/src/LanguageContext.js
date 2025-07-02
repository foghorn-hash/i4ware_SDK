import React, { createContext, useEffect, useState } from "react";
import LocalizedStrings from "react-localization";
import { API_DEFAULT_LANGUAGE } from "./constants/apiConstants";

const strings = new LocalizedStrings({
  en: {
    login: "Login",
    logout: "Logout",
    myProfile: "My Profile",
    stlViewer: "3D Viewer",
    manageUsers: "Manage Users",
    manageDomains: "Manage Domains",
    manageRoles: "Manage Roles",
    settings: "Settings",
    welcome: "Welcome",
    videoPhoto: "Video/Photo",
    chat: "Chat",
    revenueReport: "Revenues",
  },
  fi: {
    login: "Kirjaudu sisään",
    logout: "Kirjaudu ulos",
    myProfile: "Oma Profiili",
    stlViewer: "3D-katseluohjelma",
    manageUsers: "Käyttäjät",
    manageDomains: "Domainit",
    manageRoles: "Roolit",
    settings: "Asetukset",
    welcome: "Tervetuloa",
    videoPhoto: "Video/Kuva",
    chat: "Chatti",
    revenueReport: "Liikevaihtod",
  },
  sv: {
    login: "Logga in",
    logout: "Logga ut",
    myProfile: "Min Profil",
    stlViewer: "3D-visningsprogram",
    manageUsers: "Hantera användare",
    manageDomains: "Hantera domäner",
    manageRoles: "Hantera roller",
    settings: "Inställningar",
    welcome: "Välkommen",
    videoPhoto: "Video/Foto",
    chat: "Chatt",
    revenueReport: "Intäkter",
  },
});

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const defaultLanguage =
    new URLSearchParams(window.location.search).get("lang") ||
    API_DEFAULT_LANGUAGE ||
    "en";
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext, LanguageProvider };
