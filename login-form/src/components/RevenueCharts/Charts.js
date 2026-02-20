import React, { useState, useEffect } from "react";
import TransactionsTable from "./TransactionsTable";
import CustomersTable from "./CustomersTable";
import axios from "axios";
import ButtonsToAdd from "./ButtonsToAdd";
import TransactionsTableAll from "./TransactionsTableAll";
import CumulativeChart from "./CumulativeChart";
import MonthlyIncomeForYear from "./MonthlyIncomeForYear";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { useTranslation } from "react-i18next";

const Charts = () => {
  const [availableYears, setAvailableYears] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const { t, i18n } = useTranslation();

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