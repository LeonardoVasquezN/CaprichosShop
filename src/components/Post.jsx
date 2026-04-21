'use client';
import Style from './Post.module.css';
import Image from 'next/image';
import Icognito from '../../public/images/icognito.png';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Post() {

  const contenedorRef = useRef(null);
  const contenedorProductosRef = useRef(null);

  const [cliente, setCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  const [productosBD, setProductosBD] = useState([]);
  const [mostrarProductos, setMostrarProductos] = useState(false);

  const [productos, setProductos] = useState([]);

  const [tipoComprobante, setTipoComprobante] = useState('');
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const obtenerClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*');

    if (!error) {
      setClientes(data);
      setMostrarLista(true);
    }
  };

  const obtenerProductos = async () => {
    const { data, error } = await supabase
      .from('producto')
      .select('*');

    if (!error) {
      setProductosBD(data);
      setMostrarProductos(true);
    }
  };

  const agregarProducto = (producto) => {
    const existe = productos.find(p => p.id === producto.id);

    if (existe) {
      const nuevos = productos.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      );
      setProductos(nuevos);
    } else {
      setProductos([
        ...productos,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio_venta,
          cantidad: 1
        }
      ]);
    }

    setMostrarProductos(false);
  };

  const handleChange = (index, field, value) => {
    const nuevos = [...productos];
    nuevos[index][field] = Number(value);
    setProductos(nuevos);
  };

  const total = productos.reduce((acc, prod) => {
    return acc + (prod.precio * prod.cantidad);
  }, 0);

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (contenedorRef.current && !contenedorRef.current.contains(event.target)) {
        setMostrarLista(false);
      }

      if (contenedorProductosRef.current && !contenedorProductosRef.current.contains(event.target)) {
        setMostrarProductos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);

  // const imprimir = async () => {
  //   const res = await fetch("/api/print", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       cliente,
  //       productos,
  //       total
  //     })
  //   });

  //   const data = await res.json();

  //   if (data.ok) {
  //     alert("Impreso correctamente");
  //   } else {
  //     alert("Error al imprimir");
  //   }
  // };

  return(
    <>
      <div className='noPrint'>
        <h1 className={Style.title}>Nuevo Comprobante</h1>
        <div className={Style.contentComprobanteCliente}>
          <h1 className={Style.tituloComprobante}>Tipo de COMPROBANTE</h1>
          <div className={Style.contentBotones}>
            <button
              className={`${Style.buttons} ${tipoComprobante === 'NV' ? Style.buttonActive : ''}`}
              onClick={() => setTipoComprobante('NV')}
            >
              NV-NOTA DE VENTA
            </button>
            <button
              className={`${Style.buttons} ${tipoComprobante === 'B' ? Style.buttonActive : ''}`}
              onClick={() => setTipoComprobante('B')}
            >
              B-BOLETA
            </button>
            <button
              className={`${Style.buttons} ${tipoComprobante === 'F' ? Style.buttonActive : ''}`}
              onClick={() => setTipoComprobante('F')}
            >
              F-FACTURA
            </button>
          </div>
          {/* CLIENTE */}
          <div className={Style.imagenInput} ref={contenedorRef}>
            <Image
              src={Icognito}
              alt="cliente"
              width={25}
              height={25}
              style={{ cursor: 'pointer' }}
              onClick={() => setCliente('CLIENTE GENÉRICO')}
            />
            <input
              className={Style.inputCliente}
              placeholder='Buscar Cliente'
              value={cliente}
              onClick={obtenerClientes}
              onChange={(e) => setCliente(e.target.value)}
            />
            {mostrarLista && (
              <div className={Style.listaClientes}>
                {clientes.map((c) => (
                  <div
                    key={c.id}
                    className={Style.itemCliente}
                    onClick={() => {
                      setCliente(c.nombre);
                      setMostrarLista(false);
                    }}
                  >
                    {c.nombre} - {c.documento}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={Style.contentBuscarProducto} ref={contenedorProductosRef}>
            <button onClick={obtenerProductos} className={Style.buscarProducto}>
              Buscar Producto
            </button>
            {mostrarProductos && (
              <div className={Style.listaProductos}>
                {productosBD.map((p) => (
                  <div
                    key={p.id}
                    className={Style.itemProducto}
                    onClick={() => agregarProducto(p)}
                  >
                    {p.nombre} - S/ {p.precio_venta}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* TABLA */}
          <table className={Style.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>P. Unit</th>
                <th>Cant.</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod, i) => (
                <tr key={prod.id}>
                  <td>{prod.nombre}</td>
                  <td>
                    <input
                      className={Style.inputTabla}
                      type="number"
                      value={prod.precio}
                      onChange={(e) => handleChange(i, 'precio', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className={Style.inputTabla}
                      type="number"
                      value={prod.cantidad}
                      onChange={(e) => handleChange(i, 'cantidad', e.target.value)}
                    />
                  </td>
                  <td>
                    S/ {prod.precio * prod.cantidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TOTAL */}
          <div className={Style.totalContainer}>
            <h2>Total: S/ {total}</h2>
          </div>
          <button
            className={Style.btnCrear}
            onClick={() => {
              if (!tipoComprobante) {
                alert('Selecciona tipo de comprobante');
                return;
              }
              setMostrarPreview(true);
            }}
          >
            Crear
          </button>
        </div>
      </div>

      {mostrarPreview && (
        <div className={Style.modalOverlay}>
          
          <div className={Style.ticket}>

            {tipoComprobante === 'NV' && (
              <>
                <h3>NOTA DE VENTA</h3>
                <p>{cliente || 'CLIENTE GENÉRICO'}</p>

                {productos.map(p => (
                  <div key={p.id} className={Style.ticketItem}>
                    <span>{p.nombre} x{p.cantidad}</span>
                    <span>S/ {p.precio * p.cantidad}</span>
                  </div>
                ))}

                <div className={Style.ticketTotal}>
                  Total: S/ {total}
                </div>
              </>
            )}

            {tipoComprobante === 'B' && (
              <>
                <h3>BOLETA ELECTRÓNICA</h3>
                <p>{cliente}</p>

                {productos.map(p => (
                  <div key={p.id} className={Style.ticketItem}>
                    <span>{p.nombre} x{p.cantidad}</span>
                    <span>S/ {p.precio * p.cantidad}</span>
                  </div>
                ))}

                <p>IGV incluido</p>

                <div className={Style.ticketTotal}>
                  Total: S/ {total}
                </div>
              </>
            )}

            <div className={Style.modalButtons}>
              <button 
                className={Style.btnPrint}
                onClick={() => window.print()}
              > 
                Imprimir
              </button>

              <button 
                className={Style.btnClose}
                onClick={() => setMostrarPreview(false)}
              >
                Cerrar
              </button>
            </div>

          </div>

        </div>
      )}
    </>
  )
}