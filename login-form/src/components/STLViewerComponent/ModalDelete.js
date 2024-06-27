import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalDelete({ show, handleClose, handleDelete, fileName }) {

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure to delete this STL model and and its screenshot? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDelete(fileName)}>
          Yes, delete it
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            No, cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDelete;