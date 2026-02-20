import React, { useState, useEffect } from 'react';
import './UserDataComponent.css';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import request from '../../utils/Request';
import { useTranslation } from 'react-i18next';

function UserDataComponent() {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      let message = "";
      try {
        const response = await request().get(API_BASE_URL + '/api/users/userdata', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN_NAME) }
        });
        
        if (response.status !== 200) {
          message = t('unauthorized');
        } else {
          message = response.data.name;
        }
      } catch (error) {
        message = t('unauthorized');
      }
      
      setSuccessMessage(message);
    };

    fetchUserData();
  }, [t]);

  return (
    <div className="userMessage">
      {t('welcome')}, {successMessage}
    </div>
  );
}

export default UserDataComponent;