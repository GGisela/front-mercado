import React, { useState, useEffect } from 'react';
import { getProductos, crearVenta } from './api';
import { ShoppingCart, Package, History, Trash2, Plus, User, Users } from 'lucide-react';
import axios from 'axios';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  // --- DINÁMICO: Estado para los clientes de la BD ---
  const [clientes, setClientes] = useState([]);
  const [clienteActivo, setClienteActivo] = useState(""); 

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // 1. Cargamos Productos
      const resProd = await getProductos();
      setProductos(resProd.data);
      
      // 2. Cargamos Historial de Ventas
      const resHist = await axios.get('http://localhost:8080/api/ventas');
      setHistorial(resHist.data);

      // 3. Cargamos Clientes Reales de tu DBA
      // Asegúrate de que tu Controller tenga un GetMapping en /api/clientes
      const resClientes = await axios.get('http://localhost:8080/api/clientes');
      setClientes(resClientes.data);
      
      // Seteamos el primer cliente de la lista por defecto si existe
      if (resClientes.data.length > 0) {
        setClienteActivo(resClientes.data[0].id_cliente);
      }
    } catch (err) {
      console.error("Error cargando datos globales:", err);
    }
  };

  const agregarAlCarrito = (p) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id_Producto === p.id_Producto);
      if (existe) {
        return prev.map(item =>
          item.id_Producto === p.id_Producto ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...p, cantidad: 1 }];
    });
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0 || !clienteActivo) {
        alert("El carrito está vacío o no hay cliente seleccionado");
        return;
    }
    setCargando(true);

    const ventaRequest = {
      id_cliente: Number(clienteActivo), 
      items: carrito.map(item => ({
        id_producto: item.id_Producto,
        cantidad: item.cantidad
      }))
    };

    try {
      await crearVenta(ventaRequest);
      alert("¡Compra exitosa!");
      setCarrito([]);
      cargarDatos(); // Refrescamos historial
    } catch (err) {
      alert("Error en la venta.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER DINÁMICO */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', marginBottom: '30px', paddingBottom: '15px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={40} color="#2563eb" /> Mercado Online
        </h1>
        
        {/* SELECTOR DE CLIENTES REALES */}
        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <Users size={18} color="#0369a1" />
            <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Sesión de Usuario:</span>
          </div>
          <select 
            value={clienteActivo} 
            onChange={(e) => {
              setClienteActivo(e.target.value);
              setCarrito([]); 
            }}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #0369a1', cursor: 'pointer' }}
          >
            {clientes.length === 0 && <option>Cargando clientes...</option>}
            {clientes.map(c => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido} (ID: {c.id_cliente})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* GRILLA DE PRODUCTOS */}
        <main>
          <h2 style={{ borderLeft: '5px solid #2563eb', paddingLeft: '10px' }}>Catálogo de Productos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {productos.map(p => (
              <div key={p.id_Producto} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', textAlign: 'center', transition: 'transform 0.2s' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{p.nombre}</h3>
                <p style={{ color: '#059669', fontSize: '1.4rem', fontWeight: 'bold', margin: '10px 0' }}>${p.precio}</p>
                <button 
                  onClick={() => agregarAlCarrito(p)}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            ))}
          </div>
        </main>

        {/* RESUMEN DE COMPRA */}
        <aside>
          <div style={{ position: 'sticky', top: '20px', background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart /> Carrito Actual
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Comprador: <strong>{clientes.find(c => c.id_cliente == clienteActivo)?.nombre || "Anonimo"}</strong>
            </p>
            
            <div style={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {carrito.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>No hay items</p> : 
                carrito.map(item => (
                  <div key={item.id_Producto} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                    <span>{item.cantidad}x {item.nombre}</span>
                    <span style={{ fontWeight: 'bold' }}>${(item.cantidad * item.precio).toFixed(2)}</span>
                  </div>
                ))
              }
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>Total:</span>
                <span>${carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={finalizarCompra}
                disabled={cargando || carrito.length === 0}
                style={{ width: '100%', padding: '15px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {cargando ? 'Procesando...' : 'CONFIRMAR PEDIDO'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* TABLA DE HISTORIAL */}
      <footer style={{ marginTop: '60px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><History /> Historial de Transacciones</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Ticket</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Monto Total</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(v => (
              <tr key={v.id_venta} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px' }}>#000{v.id_venta}</td>
                <td style={{ padding: '15px' }}>{v.cliente?.nombre} {v.cliente?.apellido}</td>
                <td style={{ padding: '15px' }}>{v.fechaVenta}</td>
                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>${v.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </footer>
    </div>
  );
}

export default App;