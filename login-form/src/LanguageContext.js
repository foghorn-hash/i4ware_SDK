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
    timesheet: "Timesheet",

    /*Timesheet's translations*/
    timesheetNameLabel: "Timesheet name",
    timesheetNamePlaceholder: "Enter timesheet name",

    //employee
    employeeLabel: "Employee",
    employeePlaceholder: "Enter your name",

    //job
    jobTitleLabel: "Job title",
    jobTitlePlaceholder: "Enter job title",

    //project
    projectLabel: "Cost center / Project",
    projectPlaceholder: "Enter cost center or project",

    //date and time
    dateLabel: "Date",
    startTimeLabel: "Start time",
    endTimeLabel: "End time",

    //normal hours
    normalHoursLabel: "Normal hours",
    normalHoursPlaceholder: "Enter hours worked",

    //extra hours
    extrasLaLabel: "Extras Sat",
    extrasSuLabel: "Extras Sun",
    extrasEveningLabel: "Extras Evening",
    extrasNightLabel: "Extras Night",
    extrasPlaceholder: "Enter hours if any",
    showExtrasPlaceholder: "Fill in",

    //overtime hours
    overtimeVrk50Label: "Overtime day 50%",
    overtimeVrk100Label: "Overtime day 100%",
    overtimeVko50Label: "Overtime week 50%",
    overtimeVko100Label: "Overtime week 100%",
    overtimePlaceholder: "Enter hours if any",
    showOvertimePlaceholder: "Fill in",

    //compensations
    atvLabel: "ATV (holiday hours)",
    travelLabel: "Travel hours",
    mealLabel: "Meal compensation",

    toolCompLabel: "Tool compensation",
    toolCompPlaceholder: "Enter euros",

    //daily allowance
    dailyAllowance: "Daily allowance",
    none: "No",
    partial: "Partial",
    full: "Full",

    //km
    kmLabel: "Mileage",
    kmPlaceholder: "Enter kilometers",
    kmNoteLabel: "Mileage note",
    kmNotePlaceholder: "Purpose of travel (e.g., meeting)",
    kmDescInfo: "Fill in",

    //notes and memo
    noteLabel: "Notes",
    notePlaceholder: "Short note, e.g., delay or special situation",

    memoLabel: "MEMO",
    memoPlaceholder: "Write detailed description or memo here",

    //buttons
    toggleExtrasShow: "Show extras",
    toggleExtrasHide: "Hide extras",

    toggleOvertimeShow: "Show overtime",
    toggleOvertimeHide: "Hide overtime",

    addRowButton: "➕ Add row",
    clearAllButton: "🗑 Clear all",

    //validators and messages
    messageTooBig: "This number is too large",
    messageTooSmall: "This number is too small",

    requiredField: "This field is required",

    successSendForm: "Row added successfully",
    errorSendForm: "Failed to add row",

    successClearForm: "All data cleared",
    errorClearForm: "Failed to clear data",
    emptyClearForm: "Nothing to clear because the form is empty",

    timeValidationMessage: "Start time can not be later than end time",

    //summary
    summaryHeader: "Summary",
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
    timesheet: "Tuntikortti",

    /*Timesheet's translations - finnish*/
    timesheetNameLabel: "Tuntikortin nimi",
    timesheetNamePlaceholder: "Syötä tuntikortin nimi",

    //emplyee
    employeeLabel: "Työntekijä",
    employeePlaceholder: "Syötä nimesi",

    //job
    jobTitleLabel: "Ammattinimike",
    jobTitlePlaceholder: "Syötä ammatti",

    //project
    projectLabel: "Kustannuspaikka ja/tai projekti",
    projectPlaceholder: "Syötä kustannuspaikka tai projekti",

    //date and time
    dateLabel: "PVM ",
    startTimeLabel: "Työajan alku",
    endTimeLabel: "Työajan loppu",

    //normal hours
    normalHoursLabel: "Norm. tunnit",
    normalHoursPlaceholder: "Syötä tehdyt työtunnit",

    //extras
    extrasLaLabel: "Lisät la",
    extrasSuLabel: "Lisät su",
    extrasEveningLabel: "Lisät Ilta",
    extrasNightLabel: "Lisät Yö",
    extrasPlaceholder: "Syötä tunteina, jos on",
    showExtrasPlaceholder: "Täytä",

    //overtimes
    overtimeVrk50Label: "Ylityö vrk 50%",
    overtimeVrk100Label: "Ylityö vrk 100%",
    overtimeVko50Label: "Ylityö vko 50%",
    overtimeVko100Label: "Ylityö vko 100%",
    overtimePlaceholder: "Syötä tunteina, jos on",
    showOvertimePlaceholder: "Täytä",

    //compensations
    atvLabel: "ATV (arkipyhättunnit)",
    travelLabel: "Matkatunnit",
    mealLabel: "Ateriakorvaus",

    toolCompLabel: "Työkalukorvaus",
    toolCompPlaceholder: "Syötä euroina",

    //daily allowance
    dailyAllowance: "Päiväraha",
    none: "Ei",
    partial: "Osa",
    full: "Koko",

    //kilometers
    kmLabel: "Kilometrikorvaus",
    kmPlaceholder: "Syötä kilometrit",
    kmNoteLabel: "Kilometrikorvaus selite",
    kmNotePlaceholder: "Matkan tarkoitus (esim. työpalaveri)",
    kmDescInfo: "Täytä",

    //notes and memo
    noteLabel: "Huomioita",
    notePlaceholder: "Lyhyt huomio, esim. myöhästyminen tai erityisolosuhde",

    memoLabel: "MEMO",
    memoPlaceholder: "Kirjoita tarkempi selite tai muistiinpano tähän",

    //buttons
    toggleExtrasShow: "Lisät näkyviin",
    toggleExtrasHide: "Lisät piiloon",

    toggleOvertimeShow: "Ylityöt näkyviin",
    toggleOvertimeHide: "Ylityöt piiloon",

    addRowButton: "➕ Lisää rivi",
    clearAllButton: "🗑 Tyhjennä kaikki",

    //validations and messages
    messageTooBig: "Liian iso luku",
    messageTooSmall: "Ei ole kelvollinen luku",

    requiredField: "Tämä kenttä on pakollinen",

    successSendForm: "Rivi lisätty onnistuneesti",
    errorSendForm: "Rivin lisääminen epäonnistui",

    successClearForm: "Kaikki tiedot tyhjennetty",
    errorClearForm: "Tyhjennys epäonnistui",
    emptyClearForm: "Nollaa ei voi, koska lomake on tyhjä",

    timeValidationMessage: "Alku aika ei voi olla myöhempi kuin loppu aika",

    //summary
    summaryHeader: "Yhteenveto",
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
    timesheet: "Tidrapport",

    /*Timesheet's translations - swedish*/
    timesheetNameLabel: "Tidkortets namn",
    timesheetNamePlaceholder: "Ange tidkortets namn",

    //employee
    employeeLabel: "Anställd",
    employeePlaceholder: "Ange ditt namn",

    //job
    jobTitleLabel: "Jobbtitel",
    jobTitlePlaceholder: "Ange jobbtitel",

    //project
    projectLabel: "Kostnadsställe / Projekt",
    projectPlaceholder: "Ange kostnadsställe eller projekt",
    dateLabel: "Datum",
    startTimeLabel: "Starttid",
    endTimeLabel: "Sluttid",
    normalHoursLabel: "Normaltimmar",
    normalHoursPlaceholder: "Ange arbetade timmar",

    //extras
    extrasLaLabel: "Tillägg lör",
    extrasSuLabel: "Tillägg sön",
    extrasEveningLabel: "Tillägg kväll",
    extrasNightLabel: "Tillägg natt",
    extrasPlaceholder: "Ange timmar om det finns",
    showExtrasPlaceholder: "Fylla i",

    //overtimes
    overtimeVrk50Label: "Övertid dag 50%",
    overtimeVrk100Label: "Övertid dag 100%",
    overtimeVko50Label: "Övertid vecka 50%",
    overtimeVko100Label: "Övertid vecka 100%",
    overtimePlaceholder: "Ange timmar om det finns",
    showOvertimePlaceholder: "Fylla i",

    //compensations
    atvLabel: "ATV (helgtimmar)",
    travelLabel: "Resetimmar",
    mealLabel: "Måltidsersättning",

    toolCompLabel: "Verktygsersättning",
    toolCompPlaceholder: "Ange i euro",

    //daily allowance
    dailyAllowance: "Dagtraktamente",
    none: "Ingen",
    partial: "Del",
    full: "Hel",

    //kilometers
    kmLabel: "Kilometersättning",
    kmPlaceholder: "Ange kilometer",
    kmNoteLabel: "Kilometersättning anteckning",
    kmNotePlaceholder: "Syfte med resan (t.ex. möte)",
    kmDescInfo: "Fylla i",

    //notes and memo
    noteLabel: "Noteringar",
    notePlaceholder: "Kort notering, t.ex. försening eller särskilda omständigheter",

    memoLabel: "MEMO",
    memoPlaceholder: "Skriv detaljerad beskrivning eller anteckning här",

    //buttons
    toggleExtrasShow: "Visa tillägg",
    toggleExtrasHide: "Dölj tillägg",

    toggleOvertimeShow: "Visa övertid",
    toggleOvertimeHide: "Dölj övertid",

    addRowButton: "➕ Lägg till rad",
    clearAllButton: "🗑 Rensa allt",

    //validations and messages
    messageTooBig: "För stort tal",
    messageTooSmall: "Ogiltigt tal",

    requiredField: "Detta fält är obligatoriskt",

    successSendForm: "Raden har lagts till",
    errorSendForm: "Det gick inte att lägga till raden",

    successClearForm: "Alla data har rensats",
    errorClearForm: "Rensning misslyckades",
    emptyClearForm: "Inget att rensa eftersom formuläret är tomt",

    timeValidationMessage: "Starttiden kan inte vara senare än sluttiden",

    //summary
    summaryHeader: "Sammanfattning",
  },
});

// Resolve the best initial language

function getInitialLanguage() {
  const saved = localStorage.getItem("appLang");
  if (saved && strings.getAvailableLanguages().includes(saved)) return saved;

  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl && strings.getAvailableLanguages().includes(fromUrl)) return fromUrl;

  return API_DEFAULT_LANGUAGE || "en";
}

// Set language immediately so strings are correct
// on the first render
const initialLanguage = getInitialLanguage();
strings.setLanguage(initialLanguage);

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(initialLanguage);

  // Wrap setLanguage so it always keeps strings + localStorage in sync
  const setLanguage = (lang) => {
    strings.setLanguage(lang);
    localStorage.setItem("appLang", lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, strings }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext, LanguageProvider };