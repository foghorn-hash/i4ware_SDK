import React from 'react';
import { useState } from 'react';
import './Modal.css';
import Button from 'react-bootstrap/Button';

const Modal = ({ show, children }) => {
	
  const [modalState, setModalState] = useState(show);
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
	<div className={showHideClassName}>
      <section className="card modal-main">
        {children}
        <div className="clear"></div>
      </section>
    </div>
  );
};

export default Modal;