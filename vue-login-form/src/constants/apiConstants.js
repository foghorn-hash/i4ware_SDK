export const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
export const API_STORAGE_BASE_URL =
  import.meta.env.VITE_SERVER_STORAGE_URL || `${API_BASE_URL}/storage`;
export const API_DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE;
export const ACCESS_TOKEN_NAME = 'login_access_token';
export const ACCESS_USER_DATA = 'login_user_data';
export const API_PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
export const API_PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
export const APP_DOMAIN_ADMIN = import.meta.env.VITE_DOMAIN_ADMIN;
export const APP_RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;