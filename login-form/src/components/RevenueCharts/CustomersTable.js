import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import LOADING from '../../tube-spinner.svg';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import { useTranslation } from "react-i18next";


const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
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
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_BASE_URL + "/api/reports/customer", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
        },
      }); // Replace with your Laravel API URL
      const data = response.data.data;
      console.log(data)


      setCustomers(data);

    } catch (err) {
      setError(t('customererror'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen"><img src={LOADING} alt={t('loading')} /></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>{t('customertitle')}</h2>
      <Table className="customer-table" bordered >
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Customer Name</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <th>{customer.id}</th>
              <th>{customer.name}</th>
            </tr>
          ))}

        </tbody>
      </Table>
    </div>
  );
};

export default CustomersTable;