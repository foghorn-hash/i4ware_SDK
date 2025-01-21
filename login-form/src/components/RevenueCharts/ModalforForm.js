
import Modal from 'react-bootstrap/Modal';
import CustomerForm from "./CustomerForm";
import TransactionForm from "./TransactionForm";


const ModalforForm = ({show, handleClose, formType}) =>{



return (
    <div>
<Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {formType === "Customer" ? <CustomerForm handleClose={handleClose}/> : <TransactionForm handleClose={handleClose}/>}
        </Modal.Body>

      </Modal></div>


    ) }

    export default ModalforForm