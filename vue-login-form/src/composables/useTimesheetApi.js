import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function setupApiAuth() {
  const token = localStorage.getItem(ACCESS_TOKEN_NAME);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}