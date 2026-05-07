import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// Asegúrate de que tenga la palabra "export" antes de "const"
export const getProductos = () => api.get('/productos');

// Esta es la función que te está reclamando el error:
export const crearVenta = (venta) => api.post('/ventas', venta);