import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/global.css';

// Global Axios Configuration to bypass localtunnel security reminder
// Global Axios Configuration to bypass localtunnel security reminder
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';
axios.defaults.headers.common['localtunnel-warning'] = 'bypass';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

// Global Fetch Interceptor to bypass localtunnel security reminder
const originalFetch = window.fetch;
window.fetch = async function () {
  let [resource, config] = arguments;
  if (!config) {
    config = {};
  }
  if (!config.headers) {
    config.headers = {};
  }
  if (config.headers instanceof Headers) {
    config.headers.append('Bypass-Tunnel-Reminder', 'true');
    config.headers.append('localtunnel-warning', 'bypass');
    config.headers.append('ngrok-skip-browser-warning', '69420');
  } else {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    config.headers['localtunnel-warning'] = 'bypass';
    config.headers['ngrok-skip-browser-warning'] = '69420';
  }
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);