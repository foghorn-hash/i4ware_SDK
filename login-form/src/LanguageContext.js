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
    
    successSend: "Row added successfully",
    errorSend: "Failed to add row",

    successClear: "All data cleared",
    errorClear: "Failed to clear data",

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

    /*Timesheetin käännökset*/
    timesheetNameLabel: "Tuntikortin nimi",
    timesheetNamePlaceholder: "Syötä tuntikortin nimi",

    //työntekijä
    employeeLabel: "Työntekijä",
    employeePlaceholder: "Syötä nimesi",

    //ammatti
    jobTitleLabel: "Ammattinimike",
    jobTitlePlaceholder: "Syötä ammatti",

    //projekti
    projectLabel: "Kustannuspaikka ja/tai projekti",
    projectPlaceholder: "Syötä kustannuspaikka tai projekti",

    //pvm ja aika
    dateLabel: "PVM ",
    startTimeLabel: "Työajan alku",
    endTimeLabel: "Työajan loppu",

    //tavalliset tunnit
    normalHoursLabel: "Norm. tunnit",
    normalHoursPlaceholder: "Syötä tehdyt työtunnit",
    
    //lisät
    extrasLaLabel: "Lisät la",
    extrasSuLabel: "Lisät su",
    extrasEveningLabel: "Lisät Ilta",
    extrasNightLabel: "Lisät Yö",
    extrasPlaceholder: "Syötä tunteina, jos on",
    showExtrasPlaceholder: "Täytä",

    //ylityöt
    overtimeVrk50Label: "Ylityö vrk 50%",
    overtimeVrk100Label: "Ylityö vrk 100%",
    overtimeVko50Label: "Ylityö vko 50%",
    overtimeVko100Label: "Ylityö vko 100%",
    overtimePlaceholder: "Syötä tunteina, jos on",
    showOvertimePlaceholder: "Täytä", 

    //kompensaatiot
    atvLabel: "ATV (arkipyhättunnit)",
    travelLabel: "Matkatunnit",
    mealLabel: "Ateriakorvaus",

    toolCompLabel: "Työkalukorvaus",
    toolCompPlaceholder: "Syötä euroina",

    //kilometrit
    kmLabel: "Kilometrikorvaus",
    kmPlaceholder: "Syötä kilometrit",
    kmNoteLabel: "Kilometrikorvaus selite",
    kmNotePlaceholder: "Matkan tarkoitus (esim. työpalaveri)",
    kmDescInfo: "Täytä",

    //huomiot ja memo
    noteLabel: "Huomioita",
    notePlaceholder: "Lyhyt huomio, esim. myöhästyminen tai erityisolosuhde",

    memoLabel: "MEMO",
    memoPlaceholder: "Kirjoita tarkempi selite tai muistiinpano tähän",

    //napit
    toggleExtrasShow: "Lisät näkyviin",
    toggleExtrasHide: "Lisät piiloon",

    toggleOvertimeShow: "Ylityöt näkyviin",
    toggleOvertimeHide: "Ylityöt piiloon",

    addRowButton: "➕ Lisää rivi",
    clearAllButton: "🗑 Tyhjennä kaikki",

    //tarkistukset ja viestit
    messageTooBig: "Liian iso luku",
    messageTooSmall: "Ei ole kelvollinen luku",

    requiredField: "Tämä kenttä on pakollinen",

    successSend: "Rivi lisätty onnistuneesti",
    errorSend: "Rivin lisääminen epäonnistui",

    successClear: "Kaikki tiedot tyhjennetty",
    errorClear: "Tyhjennys epäonnistui",

    //yhteenveto
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

    /*Översättningar för tidrapporten*/
    timesheetNameLabel: "Tidkortets namn",
    timesheetNamePlaceholder: "Ange tidkortets namn",

    //anställd
    employeeLabel: "Anställd",
    employeePlaceholder: "Ange ditt namn",

    //yrke
    jobTitleLabel: "Jobbtitel",
    jobTitlePlaceholder: "Ange jobbtitel",

    //projekt
    projectLabel: "Kostnadsställe / Projekt",
    projectPlaceholder: "Ange kostnadsställe eller projekt",
    dateLabel: "Datum",
    startTimeLabel: "Starttid",
    endTimeLabel: "Sluttid",
    normalHoursLabel: "Normaltimmar",
    normalHoursPlaceholder: "Ange arbetade timmar",

    //tillägg
    extrasLaLabel: "Tillägg lör",
    extrasSuLabel: "Tillägg sön",
    extrasEveningLabel: "Tillägg kväll",
    extrasNightLabel: "Tillägg natt",
    extrasPlaceholder: "Ange timmar om det finns",
    showExtrasPlaceholder: "Fylla i",

    //övertid
    overtimeVrk50Label: "Övertid dag 50%",
    overtimeVrk100Label: "Övertid dag 100%",
    overtimeVko50Label: "Övertid vecka 50%",
    overtimeVko100Label: "Övertid vecka 100%",
    overtimePlaceholder: "Ange timmar om det finns",
    showOvertimePlaceholder: "Fylla i",  

    //kompensationer
    atvLabel: "ATV (helgtimmar)",
    travelLabel: "Resetimmar",
    mealLabel: "Måltidsersättning",

    toolCompLabel: "Verktygsersättning",
    toolCompPlaceholder: "Ange i euro",

    //kilometer
    kmLabel: "Kilometersättning",
    kmPlaceholder: "Ange kilometer",
    kmNoteLabel: "Kilometersättning anteckning",
    kmNotePlaceholder: "Syfte med resan (t.ex. möte)",
    kmDescInfo: "Fylla i",

    //anteckningar och memo
    noteLabel: "Noteringar",
    notePlaceholder: "Kort notering, t.ex. försening eller särskilda omständigheter",

    memoLabel: "MEMO",
    memoPlaceholder: "Skriv detaljerad beskrivning eller anteckning här",

    //knappar
    toggleExtrasShow: "Visa tillägg",
    toggleExtrasHide: "Dölj tillägg",

    toggleOvertimeShow: "Visa övertid",
    toggleOvertimeHide: "Dölj övertid",

    addRowButton: "➕ Lägg till rad",
    clearAllButton: "🗑 Rensa allt",

    //kontroller och meddelanden
    messageTooBig: "Liian iso luku",
    messageTooSmall: "Ei ole kelvollinen luku",

    requiredField: "Detta fält är obligatoriskt",

    successSend: "Raden har lagts till",
    errorSend: "Det gick inte att lägga till raden",

    successClear: "All data har rensats",
    errorClear: "Rensning misslyckades",

    //sammanfattning
    summaryHeader: "Sammanfattning",
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
