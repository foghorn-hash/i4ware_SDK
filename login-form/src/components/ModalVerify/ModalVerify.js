import React from 'react';
import { useState } from 'react';
import './ModalVerify.css';
import Button from 'react-bootstrap/Button';

const ModalVerify = ({ show, children }) => {
	
  const [modalStateApproval, setModalStateApproval] = useState(show);
  const showHideClassName = show ? "modal-verify display-block" : "modal display-none";

  return (
	<div className={showHideClassName}>
      <section className="card modal-verify-main">
        {children}
        <div className="clear"></div>
      </section>
    </div>
  );
};

export default ModalVerify;