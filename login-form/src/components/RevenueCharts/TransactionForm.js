import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {API_BASE_URL, API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import axios from "axios";
import React, { useState, useEffect } from 'react';

const TransactionForm= ({handleClose}) =>{
    const [customers, setCustomers] = useState([]);
      
    
    const fetchCustomers = async () =>{

        const response = await axios.get(API_BASE_URL + "/api/reports/customer")
        const data= await response.data.data
        setCustomers(data)
          

    }
    useEffect(() => {
        fetchCustomers();
      }, []);
    
    const sendDetailsToServer = async (e) => {
        
        e.preventDefault();
        const formData = new FormData(e.target),
        formDataObj = Object.fromEntries(formData.entries())
        try{
        const response = await axios.post(API_BASE_URL + "/api/reports/transaction", formDataObj)
        if(response.status === 200 ){
            e.target.reset();
            alert("Invoice added successfully!");
            handleClose();
        }}catch(err){
            alert(err.response.data.data)

        }


    }
    
    return(
        <>
        {customers && (
        <Form onSubmit={(values) => {sendDetailsToServer(values)}}>
            <Form.Group className="mb-3" controlId="formInvoiceCustomerId">
            <Form.Label>Customer Name</Form.Label><br></br>
            <select name="customerID">
                    {customers.map(customer=>(
                        <option id={customer.id} name={customer.id} value={customer.id} >{customer.name}</option>
                    ))}
                    
                </select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceInvoiceNumber">
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control type="text" name="invoiceNumber" placeholder="Invoice Number" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceTotalExcludingVat">
                <Form.Label>Total Excluding VAT</Form.Label>
                <Form.Control type="number" step="0.01" name="totalExcludingVat" placeholder="Total Excluding VAT" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceVATPer">
                <Form.Label>VAT%</Form.Label>
                <Form.Control type="number" step="0.01" max="100" name="vatPercentage" placeholder="VAT%" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceDueDate">
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" name="dueDate" placeholder="Due Date" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceStatus">
                <Form.Label>Status: </Form.Label>
                <select id="invoiceStatus" name="status">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>

                </select>
            </Form.Group>
          
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
        )}
        </>
        
    )}

    export default TransactionForm
