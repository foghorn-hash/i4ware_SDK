import React, { useState, useContext, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import CustomersTable from "./CustomersTable";
import axios from "axios";
import ButtonsToAdd from "./ButtonsToAdd";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";
import MonthlyIncomeForYear from "./MonthlyIncomeForYear";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: {
    year: "Year",
  },
  fi: {
    year: "Vuosi",
  },
  sv: {
    year: "År",
  },
});


const Charts = () => {
  const [availableYears, setAvailableYears] = useState([]); // [2019, 2020, ...]
  const [year, setYear] = useState(new Date().getFullYear());
  const [lang, setLang] = useState(document.documentElement.lang || API_DEFAULT_LANGUAGE);

  // keep localization synced with <html lang="">
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang || API_DEFAULT_LANGUAGE);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => strings.setLanguage(lang), [lang]);

  useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      const url = `${API_BASE_URL}/api/reports/income-years`;
      const resp = await axios.get(url, {
                headers: {
                  Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
                },
              });
      const years = Array.isArray(resp?.data?.years) ? resp.data.years : [];
      if (cancelled) return;

      if (years.length) {
        const sorted = years.slice().sort((a, b) => a - b);
        setAvailableYears(sorted);
        // keep current year if still available, otherwise pick latest
        setYear(prev => (sorted.includes(prev) ? prev : sorted[sorted.length - 1]));
      } else {
        const cur = new Date().getFullYear();
        setAvailableYears([cur]);
        setYear(cur);
      }
    } catch {
      if (cancelled) return;
      const cur = new Date().getFullYear();
      setAvailableYears([cur]);
      setYear(cur);
    }
  })();

  return () => { cancelled = true; };
}, []);

    return (
      <div>
        <ButtonsToAdd />
        
        <TransactionsTable />
        <MonthlyIncomeForYear year={new Date().getFullYear()} />
        <TransactionsTableAll />
        <CumulativeChart />
        <CustomersTable />
      </div>
    );
};

export default Charts;
