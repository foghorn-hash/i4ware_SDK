import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {API_DEFAULT_LANGUAGE} from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    are_you_sure: "Are you sure?",
    are_you_sure_text: "Are you sure to delete this STL model and and it's screenshot? This action cannot be undone.",
    yes: "Yes, delete it",
    no: "No, cancel",
  },
  fi: {
    are_you_sure: "Oletko varma?",
    are_you_sure_text: "Oletko varma, että haluat poistaa tämän STL-mallin ja sen kuvakaappauksen? Tätä toimintoa ei voi kumota.",
    yes: "Kyllä, poista se",
    no: "Ei, peruuta",
  },
  se: {
    are_you_sure: "Är du säker?",
    are_you_sure_text: "Är du säker på att du vill radera denna STL-modell och dess skärmdump? Denna åtgärd kan inte ångras.",
    yes: "Ja, radera den",
    no: "Nej, avbryt",
  }
});

function ModalDelete({ show, handleClose, handleDelete, fileName }) {

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
          <Modal.Title>{strings.are_you_sure}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{strings.are_you_sure_text}</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDelete(fileName)}>
            {strings.yes}
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            {strings.no}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDelete;