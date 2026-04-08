import { defineStore } from 'pinia';
import { ACCESS_TOKEN_NAME, ACCESS_USER_DATA } from '../constants/apiConstants';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const userData = localStorage.getItem(ACCESS_USER_DATA);
    return {
      user: userData ? JSON.parse(userData) : null,
      token: localStorage.getItem(ACCESS_TOKEN_NAME) || null,
      isLogged: !!localStorage.getItem(ACCESS_TOKEN_NAME),
    };
  },
  actions: {
    authStateChanged({ user, token, isLogged }) {
      this.user = user;
      this.token = token;
      this.isLogged = isLogged;
    },
  },
});