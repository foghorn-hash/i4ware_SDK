import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useTranslation } from 'react-i18next';


function ErrorRegistration({ show, handleClose, errorMessages, successMessage }) {


  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  const localizedErrorMessages = errorMessages.map((message) => {
    switch (message) {
      case 'The email has already been taken.':
        return t('email_error');
      case 'The email format is invalid':
        return t('email_error_valid');
      case 'The domain has already been taken.':
        return t('domain_error');
      case 'The domain format is invalid.':
        return t('domain_error_valid');
      default:
        return message;
    }
  });

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{successMessage ? t('success_registration') : t('error')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage ? (
            <p>{successMessage}</p>
          ) : (
            <>
              <p>{t('error_messages')}</p>
              <ul>
                {localizedErrorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
              <p>{t('end_message')}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ErrorRegistration;