import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';


function ModalDelete({ show, handleClose, handleDelete, fileName }) {
  
  const { t, i18n } = useTranslation();

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const langFromUrl = urlParams.get("lang");
    if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [i18n, urlParams]);

  return (
    <>
      <Modal show={show} onHide={handleClose} animation={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('are_you_sure')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('are_you_sure_text_delete')}</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDelete(fileName)}>
            {t('yes_delete')}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            {t('no_delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDelete;