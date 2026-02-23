import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import LOADING from '../../tube-spinner.svg';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
  LineChart,
  Brush,
} from "recharts";
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { useTranslation } from "react-i18next";


const CustomTooltip = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
        <p>
          <strong>{t('title')}:</strong> {label} <br />
          <strong>{t('name')}:</strong> {Number(payload[0].value).toFixed(2)} €
        </p>
      </div>
    );
  }
  return null;
};

const CumulativeChart = () => {
  const [chartData, setChartData] = useState([]);
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
    fetchCumulativeData();
  }, []);

  const fetchCumulativeData = async () => {
    try {
      const response = await axios.get(API_BASE_URL + "/api/reports/cumulative-sales", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      }); // Update to your API URL
      setChartData(response.data.root);
    } catch (err) {
      setError("Failed to fetch cumulative data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><img src={LOADING} alt="Loading..." /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Cumulative Sales Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 16, right: 24, left: 16, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="saleDate"
            angle={-45}
            textAnchor="end"
            interval="preserveStartEnd"
            minTickGap={20}
            tickMargin={10}
            tick={{ fontSize: 12 }}
            allowDuplicatedCategory={false}
            tickFormatter={(d) => d.slice(0, 7)} // format YYYY-MM
            height={70}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip t={t} />} />

          {/* Dashed line */}
          <Line
            type="monotone"
            dataKey="cumulativeVendorBalance"
            name={t('name')}
            stroke="#8884d8"
            strokeDasharray="5 5"     // dashed pattern
            dot={false}               // optional: remove dots for cleaner lines
            strokeWidth={2}
          />

          {/* Optional: multiple lines for comparisons */}
          {/* <Line type="monotone" dataKey="anotherMetric" stroke="#82ca9d" strokeDasharray="3 4 5 2" dot={false} /> */}

          <Brush dataKey="saleDate" height={24} travellerWidth={8} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativeChart;