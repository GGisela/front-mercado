//  asegúrate de importar getClientes
import { getProductos, crearVenta, getClientes } from './api';

// ... dentro de cargarDatos:
const cargarDatos = async () => {
  try {
    const resProd = await getProductos();
    setProductos(resProd.data);

    // USAMOS LA FUNCIÓN DEL API.JS
    const resClientes = await getClientes(); 
    console.log("Clientes cargados:", resClientes.data);
    setClientes(resClientes.data);

    if (resClientes.data.length > 0) {
       // Verifica si en tu Java es id_cliente o idCliente
       setClienteActivo(resClientes.data[0].id_cliente || resClientes.data[0].idCliente);
    }
  } catch (err) {
    console.error("Error en la carga:", err);
  }
};