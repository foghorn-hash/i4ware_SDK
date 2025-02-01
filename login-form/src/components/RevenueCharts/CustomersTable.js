import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from 'react-bootstrap/Table';
import LOADING from '../../tube-spinner.svg';
import { API_BASE_URL,  API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
// ES6 module syntax
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en:{
    title:"Customers",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
  },
  fi: {
    title:"Customers",
    error:"Failed to fetch transactions. Please try again.",
    loading:"Loading...",
  },
  sv: {
   title: "Customers",
   error:"Failed to fetch transactions. Please try again.",
   loading:"Loading...",
 }
 });

const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
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
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(API_BASE_URL + "/api/reports/customer"); // Replace with your Laravel API URL
      const data = response.data.data;
        console.log(data)
      

      setCustomers(data);
      
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
      <Table className="customer-table"  bordered >
      <thead>
        <tr>
          <th>Customer ID</th>
          <th>Customer Name</th>
        </tr>
      </thead>
      <tbody>
      {customers.map(customer=>(
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