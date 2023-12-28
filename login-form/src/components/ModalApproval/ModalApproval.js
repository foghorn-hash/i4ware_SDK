import React from 'react';
import { useState } from 'react';
import './ModalApproval.css';
import Button from 'react-bootstrap/Button';

const ModalApproval = ({ show, children }) => {
	
  const [modalStateApproval, setModalStateApproval] = useState(show);
  const showHideClassName = show ? "modal-approval display-block" : "modal display-none";

  return (
	<div className={showHideClassName}>
      <section className="card modal-approval-main">
        {children}
        <div className="clear"></div>
      </section>
    </div>
  );
};

export default ModalApproval;