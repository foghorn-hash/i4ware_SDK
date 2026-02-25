import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import LOADING from '../../tube-spinner.svg';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { useTranslation } from "react-i18next";


const TransactionsTableAll = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsMerged, setTransactionsMerged] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartDataMerged, setChartDataMerged] = useState([]);
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
    fetchMergedTransactions();
  }, []);

  const fetchMergedTransactions = async () => {
    try {
      const response = await axios.get(
        API_BASE_URL + "/api/reports/merged-sales", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      }
      ); // Replace with your Laravel API URL
      const data = response.data.root;

      // Prepare chart data
      const formattedChartData = data.map((item) => ({
        saleDate: item.saleDate,
        vendorAmount: parseFloat(item.vendorAmount),
        balanceVendor: parseFloat(item.balanceVendor),
      }));

      setTransactionsMerged(data);
      setChartDataMerged(formattedChartData);
    } catch (err) {
      setError(t('transactiontableerror'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><img src={LOADING} alt={t('loading')} /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>{t('transactiontabletitle')}</h2>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartDataMerged}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="saleDate" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vendorAmount" fill="#007bff" name={t('transactiontablename')} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionsTableAll;