import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {API_BASE_URL, API_DEFAULT_LANGUAGE, ACCESS_TOKEN_NAME} from "../../constants/apiConstants";
import axios from "axios";


const CustomerForm= ({handleClose}) =>{
  


    const sendDetailsToServer = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target),
        formDataObj = Object.fromEntries(formData.entries())
        console.log("Sending values to server:", formDataObj);
        
        
        try{
        const response = await axios.post(API_BASE_URL + "/api/reports/customer", formDataObj, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem(ACCESS_TOKEN_NAME),
          },
        });
        if(response.status === 201 ){
            e.target.reset();
            alert("Customer added successfully!");
            handleClose();
        } }catch(err){  alert(err.response.data.data)}
            
    
    
    }
    return(
        <>
       



        <Form onSubmit={(values) => {sendDetailsToServer(values)}}>
            <Form.Group className="mb-3" controlId="formInvoiceCustomerId">
                <Form.Label>Customer Name</Form.Label>
                <Form.Control type="text" name="customerName" placeholder="Customer name" />
            </Form.Group>
          
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form></>
        
    )}

    export default CustomerForm
