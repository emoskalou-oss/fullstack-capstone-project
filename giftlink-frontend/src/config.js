const defaultBackendUrl = 'https://giftlink-backend-9171.onrender.com';
const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const urlConfig = {
  backendUrl: (configuredBackendUrl || defaultBackendUrl).replace(/\/+$/, ''),
};
