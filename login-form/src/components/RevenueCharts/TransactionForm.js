import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {API_BASE_URL, API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import axios from "axios";

const TransactionForm= ({customerIDs}) =>{
    const sendDetailsToServer = async (e) => {

        e.preventDefault();
        const formData = new FormData(e.target),
        formDataObj = Object.fromEntries(formData.entries())
        console.log("Sending values to server:", formDataObj);
        //await axios.post(API_BASE_URL + "/api/reports/customer", formDataObj).then( (response) => {   console.log("Full response:", response);  })
    }
    
    return(
        <Form onSubmit={(values) => {sendDetailsToServer(values)}}>
            <Form.Group className="mb-3" controlId="formInvoiceCustomerId">
            <Form.Label>Customer ID</Form.Label><br></br>
            <select name="customerID">
                    {customerIDs.map(customerID=>(
                        <option id={customerID} name={customerID} value={customerID} >{customerID}</option>
                    ))}
                    
                </select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceInvoiceNumber">
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control type="text" name="invoiceNumber" placeholder="Invoice Number" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceTotalExcludingVat">
                <Form.Label>Total Excluding VAT</Form.Label>
                <Form.Control type="number" name="totalExcludingVat" placeholder="Total Excluding VAT" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceVATPer">
                <Form.Label>VAT%</Form.Label>
                <Form.Control type="number" name="vatPercentage" placeholder="VAT%" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceDueDate">
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" name="dueDate" placeholder="Due Date" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formInvoiceStatus">
                <Form.Label>Status: </Form.Label>
                <select id="invoiceStatus" name="status">
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>

                </select>
            </Form.Group>
          
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
        
    )}

    export default TransactionForm
