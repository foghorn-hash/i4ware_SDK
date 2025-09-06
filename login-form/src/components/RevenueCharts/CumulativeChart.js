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
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en:{
    title:"Cumulative Sales Chart",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
    name:"Cumulative Vendor Balance",
  },
  fi: {
    title:"Cumulative Sales Chart",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
    name:"Cumulative Vendor Balance",
  },
  sv: {
   title: "Cumulative Sales Chart",
   error:"Failed to fetch transactions. Please try again.",
   loading:"Loading...",
   name:"Cumulative Vendor Balance",
 }
 });

 const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>
          <strong>{strings.title}:</strong> {label}{" "}
          <strong>{strings.name}:</strong> {Number(payload[0].value).toFixed(2)} €
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
          <Tooltip content={<CustomTooltip />} />
  
          {/* Dashed line */}
          <Line
            type="monotone"
            dataKey="cumulativeVendorBalance"
            name={strings.name}
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