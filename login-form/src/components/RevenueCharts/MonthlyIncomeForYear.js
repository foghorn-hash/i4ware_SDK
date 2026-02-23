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
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { useTranslation } from "react-i18next";


const MonthlyIncomeForYear = ({ year = new Date().getFullYear() }) => {
  const [data, setData] = useState([]); // 12 rows: {label, total}
  const [yearTotal, setYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

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
        if (!cancelled) setError(t('incomeerror'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [year]);

  if (loading) return <div className="loading-screen"><img src={LOADING} alt={t('loading')} /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2 className="calculator-title">
        {t('incometitle')} — {year})
      </h2>
      <div style={{ marginBottom: 8 }}>
        <strong>{t('total')}:</strong> {yearTotal.toFixed(2)} €
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 16, bottom: 24 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tickMargin={8} height={40} />
          <YAxis />
          <Tooltip formatter={(v) => [`${Number(v).toFixed(2)} €`, "Total"]} />
          <Bar dataKey="total" name="Total" fill="#d71bddff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyIncomeForYear;
