// Central API URL for the Loopix app
// Vite exposes env vars via import.meta.env (not process.env)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1234';

export default BASE_URL;
