import React, { useEffect, useState } from "react";
import axios from "axios";
import LOADING from "../../tube-spinner.svg";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Brush,
} from "recharts";
import { API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import LocalizedStrings from "react-localization";

let strings = new LocalizedStrings({
  en: { title: "Monthly Income", loading: "Loading...", error: "Failed to fetch monthly income.", total: "Total",
        src_all: "All Sources", src_atlassian: "Atlassian Pty Ltd", src_kela: "Pension Insurance",
        src_hourly: "Hourly Rate Customers", src_grandparents: "Grandparents' Inheritance" },
  fi: { title: "Kuukausitulot", loading: "Ladataan...", error: "Kuukausitulojen hakeminen epäonnistui.", total: "Yhteensä",
        src_all: "Kaikki lähteet", src_atlassian: "Atlassian Pty Ltd", src_kela: "Eläkevakuutus",
        src_hourly: "Tuntiveloitusasiakkaat", src_grandparents: "Isovanhempien perintö" },
  sv: { title: "Månadsinkomst", loading: "Laddar...", error: "Misslyckades att hämta månadsinkomst.", total: "Totalt",
        src_all: "Alla källor", src_atlassian: "Atlassian Pty Ltd", src_kela: "Pensionsförsäkring",
        src_hourly: "Timdebiterade kunder", src_grandparents: "Mor- och farföräldrars arv" },
});

const MonthlyIncomeForYear = ({ year = new Date().getFullYear() }) => {
  const [lang, setLang] = useState(document.documentElement.lang || API_DEFAULT_LANGUAGE);
  const [data, setData] = useState([]); // 12 rows: {label, total}
  const [yearTotal, setYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // track <html lang="">
  useEffect(() => {
    const obs = new MutationObserver(() => setLang(document.documentElement.lang || API_DEFAULT_LANGUAGE));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => obs.disconnect();
  }, []);
  useEffect(() => strings.setLanguage(lang), [lang]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const url = `${API_BASE_URL}/api/reports/merged-monthly-sums?year=${encodeURIComponent(year)}`;
        const r = await axios.get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        });
        if (!cancelled) {
          setData(Array.isArray(r?.data?.root) ? r.data.root : []);
          setYearTotal(Number(r?.data?.yearTotal || 0));
        }
      } catch (e) {
        if (!cancelled) setError(strings.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [year]);

  if (loading) return <div className="loading-screen"><img src={LOADING} alt={strings.loading} /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2 className="calculator-title">
        {strings.title} — {year})
      </h2>
      <div style={{ marginBottom: 8 }}>
        <strong>{strings.total}:</strong> {yearTotal.toFixed(2)} €
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 16, bottom: 24 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tickMargin={8} height={40} />
          <YAxis />
          <Tooltip formatter={(v)=>[`${Number(v).toFixed(2)} €`, "Total"]} />
          <Bar dataKey="total" name="Total" fill="#d71bddff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyIncomeForYear;
