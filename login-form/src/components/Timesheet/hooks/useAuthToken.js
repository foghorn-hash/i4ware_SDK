import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../../../constants/apiConstants';
import jwtDecode from "jwt-decode";

/** === API setup === */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" } 
});

export function useAuthToken() {
    const [authToken, setAuthToken] = useState(() => {
      try {
        const raw = localStorage.getItem(ACCESS_TOKEN_NAME);
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          return parsed.token ?? parsed.access_token ?? parsed.authToken ?? raw;
        } catch {
          return raw;
        }
      } catch {
        return null;
      }
    });
  
    useEffect(() => {
      if (authToken) {
        api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
        try {
          const decoded = jwtDecode(authToken);
          setUserId(decoded.user_id || decoded.id);
        } catch (e) {
          setUserId(null);
        }
      } else {
        delete api.defaults.headers.common.Authorization;
      }
    }, [authToken]);
  
    useEffect(() => {
      const onStorage = (e) => {
        if (e.key === ACCESS_TOKEN_NAME) setAuthToken(e.newValue);
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, []);
  
    return { authToken, setAuthToken };
  }