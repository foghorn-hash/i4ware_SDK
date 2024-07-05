import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    error: "Error messages",
    error_messages: "Here are the mistakes in your registration form:",
    email_error: "The email has already been taken",
    email_error_valid: "The email is not valid",
    domain_error: "The domain has already been taken",
    domain_error_valid: "The domain is not valid",
    close: "Close",
    end_message: "Please, correct the mistakes and try again."
  },
  fi: {
    error: "Virheviestit",
    error_messages: "Tässä ovat virheet rekisteröintilomakkeessasi:",
    email_error: "Sähköposti on jo otettu",
    email_error_valid: "Sähköposti ei ole kelvollinen",
    domain_error: "Verkkotunnus on jo otettu",
    domain_error_valid: "Verkkotunnus ei ole kelvollinen",
    close: "Sulje",
    end_message: "Ole hyvä ja korjaa virheet ja yritä uudelleen."
  },
  se: {
    error: "Felmeddelanden",
    error_messages: "Här är felen i din registreringsformulär:",
    email_error: "E-postadressen har redan tagits",
    email_error_valid: "E-postadressen är inte giltig",
    domain_error: "Domänen har redan tagits",
    domain_error_valid: "Domänen är inte giltig",
    close: "Stäng",
    end_message: "Var god korrigera felen och försök igen."
  }
});

function ErrorRegistration ({ show, handleClose, errorMessages }) {

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{strings.error}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <p>{strings.error_messages}</p>
        <ul>
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
        </ul>
        <p>{strings.end_message}</p>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            {strings.close}
        </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ErrorRegistration;