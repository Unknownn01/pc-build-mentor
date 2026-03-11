// No Render, a VITE_API_URL será a URL base do seu backend
const productionUrl = import.meta.env.VITE_API_URL;

// Na sua máquina, para desenvolvimento local
const developmentUrl = 'http://localhost:3001';

// Exportamos APENAS a URL base
export const API_BASE_URL = productionUrl || developmentUrl;