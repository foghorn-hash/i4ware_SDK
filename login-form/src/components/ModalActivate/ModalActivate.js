import React from 'react';
import { useState } from 'react';
import './ModalActivate.css';
import Button from 'react-bootstrap/Button';

const ModalActivate = ({ show, children }) => {
	
  const [modalStateActivate, setModalStateActivate] = useState(show);
  const showHideClassName = show ? "modal-activate display-block" : "modal display-none";

  return (
	<div className={showHideClassName}>
      <section className="card modal-activate-main">
        {children}
        <div className="clear"></div>
      </section>
    </div>
  );
};

export default ModalActivate;