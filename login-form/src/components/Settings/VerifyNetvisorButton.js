import Axios from "axios";
import { useState, useEffect } from "react";
import { Button, Alert } from "react-bootstrap";

const VerifyNetvisorButton = ({ API_BASE_URL, token, enableNetvisor }) => {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState(""); // 'success', 'danger', etc.
  const [showAlert, setShowAlert] = useState(false);

  const handleVerifyNetvisor = async () => {
    // Frontend guard: check if Netvisor is enabled
    if (!enableNetvisor) {
      setAlertMessage("Netvisor is not enabled. Please enable it in settings first.");
      setAlertVariant("warning");
      setShowAlert(true);
      return;
    }

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

      // Defense-in-depth: Netvisor returns HTTP 200 even when credentials are wrong.
      // Check the response body for a FAILED status regardless of HTTP status code.
      const statusField = response.data?.ResponseStatus?.Status;
      const statusCode = Array.isArray(statusField) ? statusField[0] : statusField;

      if (statusCode === "FAILED" || response.data?.error === true) {
        const detail = Array.isArray(statusField)
          ? (statusField[1] || "")
          : (response.data?.message || "");
        console.warn("Netvisor FAILED response:", response.data);
        setAlertMessage(
          "Incorrect Netvisor details. Please check your Netvisor credentials in the server configuration." +
            (detail ? " (" + detail + ")" : "")
        );
        setAlertVariant("danger");
        setShowAlert(true);
        return;
      }

      console.log("Netvisor Connection Successful:", response.data);
      setAlertMessage("Netvisor Connection Successful!");
      setAlertVariant("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Verification failed:", error);

      // Check for different error scenarios
      if (error.response?.status === 403) {
        setAlertMessage("Netvisor is not enabled. Please enable it in settings first.");
        setAlertVariant("warning");
      } else if (error.response?.status === 422) {
        setAlertMessage("Incorrect Netvisor details. Please check your Netvisor credentials in the server configuration.");
        setAlertVariant("danger");
      } else {
        setAlertMessage("Netvisor Connection Failed! " + (error.response?.data?.message || ""));
        setAlertVariant("danger");
      }
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
      <Button 
        onClick={handleVerifyNetvisor} 
        disabled={!enableNetvisor}
        variant={enableNetvisor ? "primary" : "secondary"}
      >
        {enableNetvisor ? "Verify Netvisor" : "Enable Netvisor to Verify"}
      </Button>
    </div>
  );
};

export default VerifyNetvisorButton;
