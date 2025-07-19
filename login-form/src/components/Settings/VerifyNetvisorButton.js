import Axios from "axios";
import { useState, useEffect } from "react";
import { Button, Alert } from "react-bootstrap";

const VerifyNetvisorButton = ({ API_BASE_URL, token }) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState(""); // 'success', 'danger', etc.
  const [showAlert, setShowAlert] = useState(false);

  const handleVerifyNetvisor = async () => {
    try {
      const response = await Axios.get(
        `${API_BASE_URL}/api/netvisor/invoices`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Netvisor Response:", response.data);
      setAlertMessage("Netvisor Connection Succeessful!");
      setAlertVariant("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Verification failed:", error);
      setAlertMessage("Netvisor Connection Failed!");
      setAlertVariant("danger");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer); // cleanup
    }
  }, [showAlert]);

  return (
    <div>
      {showAlert && (
        <Alert
          variant={alertVariant}
          onClose={() => setShowAlert(false)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}
      <Button onClick={handleVerifyNetvisor}>Verify Netvisor</Button>
    </div>
  );
};

export default VerifyNetvisorButton;
