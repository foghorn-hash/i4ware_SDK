import React from 'react';
import { useState } from 'react';
import './ModalPasswordChange.css';
import Button from 'react-bootstrap/Button';

const ModalPasswordChange = ({ show, children }) => {
	
  const [modalStatePassword, setModalStatePassword] = useState(show);
  const showHideClassName = show ? "modal-password display-block" : "modal display-none";

  return (
	<div className={showHideClassName}>
      <section className="card modal-password-main">
        {children}
        <div className="clear"></div>
      </section>
    </div>
  );
};

export default ModalPasswordChange;