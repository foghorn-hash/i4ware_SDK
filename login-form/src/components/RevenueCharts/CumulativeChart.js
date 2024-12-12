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
} from "recharts";
import { API_BASE_URL, ACCESS_TOKEN_NAME, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";

const CumulativeChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCumulativeData();
  }, []);

  const fetchCumulativeData = async () => {
    try {
      const response = await axios.get(API_BASE_URL + "/api/reports/cumulative-sales"); // Update to your API URL
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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="saleDate" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cumulativeVendorBalance" fill="#99ff00" name="Cumulative Vendor Balance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativeChart;