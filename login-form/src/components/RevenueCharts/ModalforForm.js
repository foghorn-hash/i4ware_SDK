
import Modal from 'react-bootstrap/Modal';
import CustomerForm from "./CustomerForm";
import TransactionForm from "./TransactionForm";


const ModalforForm = ({show, handleClose, formType}) =>{
const customerIDs = [1,2,3,4,5,6]


return (
    <div>
<Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {formType === "Customer" ? <CustomerForm/> : <TransactionForm customerIDs={customerIDs}/>}
        </Modal.Body>

      </Modal></div>


    ) }

    export default ModalforForm