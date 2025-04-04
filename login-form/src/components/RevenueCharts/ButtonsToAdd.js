import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import ModalforForm from "./ModalforForm";
import './RevenueCharts.css';



function ButtonsToAdd() {
    const [show, setShow] = useState(false);
    const [formType, setFormType] = useState("");
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleFormType = (type) => setFormType(type);
  
    return (
        <div>
      <Button className="transaction-button" variant="primary" onClick={() => {handleShow(); handleFormType("Transaction")}}>
            Add Transactions
      </Button>
      <Button className="transaction-button" variant="primary" onClick={() => {handleShow(); handleFormType("Customer")}}>
            Add Customer
      </Button>
      <ModalforForm show={show} handleClose={handleClose}  formType={formType}/>
      

      </div>
    )}

    export default ButtonsToAdd
