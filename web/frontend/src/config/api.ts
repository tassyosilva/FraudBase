// Define a URL base da API baseada no ambiente
const API_BASE_URL = import.meta.env.PROD 
  ? window.location.origin.includes('localhost') 
    ? 'http://localhost:8080/api' 
    : `${window.location.protocol}//${window.location.hostname}:8080/api`
  : 'http://10.0.0.16:8080/api';

export default API_BASE_URL;
