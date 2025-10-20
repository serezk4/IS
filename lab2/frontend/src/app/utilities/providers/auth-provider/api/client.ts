import axios from 'axios';

export const apiClient = axios.create({
  withCredentials: true,
  timeout: 15000,
});

export const formHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
