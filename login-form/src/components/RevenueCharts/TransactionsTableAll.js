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
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en:{
    title:"Transactions with Bar Chart",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
    name:"Vendor Amount",
  },
  fi: {
    title:"Transactions with Bar Chart",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
    name:"Vendor Amount",
  },
  sv: {
   title: "Transactions with Bar Chart",
   error:"Failed to fetch transactions. Please try again.",
   loading:"Loading...",
   name:"Vendor Amount",
 }
 });

const TransactionsTableAll = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionsMerged, setTransactionsMerged] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartDataMerged, setChartDataMerged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  var query = window.location.search.substring(1);
    var urlParams = new URLSearchParams(query);
    var localization = urlParams.get('lang');
  
    if (localization==null) {
      strings.setLanguage(API_DEFAULT_LANGUAGE);
    } else {
      strings.setLanguage(localization);
    }

  useEffect(() => {
    fetchTransactions();
    fetchMergedTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        API_BASE_URL + "/api/reports/transactions"
      ); // Replace with your Laravel API URL
      const data = response.data.root;

      // Prepare chart data
      const formattedChartData = data.map((item) => ({
        saleDate: item.saleDate,
        vendorAmount: parseFloat(item.vendorAmount),
        balanceVendor: parseFloat(item.balanceVendor),
      }));

      setTransactions(data);
      setChartData(formattedChartData);
    } catch (err) {
      setError(strings.error);
    } finally {
      setLoading(false);
    }
  };


  const fetchMergedTransactions = async () => {
    try {
      const response = await axios.get(
        API_BASE_URL + "/api/reports/merged-sales"
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
      setError(strings.error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><img src={LOADING} alt={strings.loading} /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>{strings.title}</h2>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="saleDate" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vendorAmount" fill="#007bff" name={strings.name} />
        </BarChart>
      </ResponsiveContainer>
      <h2>{strings.title}</h2>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartDataMerged}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="saleDate" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="vendorAmount" fill="#007bff" name={strings.name} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionsTableAll;