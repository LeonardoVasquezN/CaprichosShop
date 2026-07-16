'use client';

import Style from './Post.module.css';
import Image from 'next/image';
import Icognito from '../../public/images/icognito.png';
import { useEffect, useRef, useState } from 'react';
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

  /*
   * NV se encuentra seleccionado inicialmente,
   * como aparece en el diseño de referencia.
   */
  const [tipoComprobante, setTipoComprobante] = useState('NV');
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const formatMoney = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const fechaActual = new Date().toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const total = productos.reduce((acc, producto) => {
    const precio = Number(producto.precio || 0);
    const cantidad = Number(producto.cantidad || 0);

    return acc + precio * cantidad;
  }, 0);

  const opGravada = total / 1.18;
  const igv = total - opGravada;
  const descuento = 0;

  const obtenerClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*');

    if (error) {
      console.error('Error al obtener clientes:', error);
      return;
    }

    setClientes(data || []);
    setMostrarLista(true);
  };

  const obtenerProductos = async () => {
    const { data, error } = await supabase
      .from('producto')
      .select('*');

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }

    setProductosBD(data || []);
    setMostrarProductos(true);
  };

  const agregarProducto = (producto) => {
    const productoExistente = productos.find(
      (item) => item.id === producto.id
    );

    if (productoExistente) {
      const nuevosProductos = productos.map((item) => {
        if (item.id === producto.id) {
          return {
            ...item,
            cantidad: Number(item.cantidad || 0) + 1,
          };
        }

        return item;
      });

      setProductos(nuevosProductos);
    } else {
      setProductos([
        ...productos,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio_venta || 0),
          cantidad: 1,
        },
      ]);
    }

    setMostrarProductos(false);
  };

  const handleChange = (index, field, value) => {
    const nuevosProductos = productos.map((producto, productoIndex) => {
      if (productoIndex !== index) {
        return producto;
      }

      return {
        ...producto,
        [field]: Number(value),
      };
    });

    setProductos(nuevosProductos);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target)
      ) {
        setMostrarLista(false);
      }

      if (
        contenedorProductosRef.current &&
        !contenedorProductosRef.current.contains(event.target)
      ) {
        setMostrarProductos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const imprimir = () => {
    window.print();
  };

  const crearComprobante = () => {
    if (!tipoComprobante) {
      alert('Selecciona un tipo de comprobante');
      return;
    }

    if (productos.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    setMostrarPreview(true);
  };

  return (
    <>
      <div className={`${Style.noPrint} noPrint`}>
        <section className={Style.comprobanteCard}>
          <header className={Style.encabezado}>
            <h1 className={Style.title}>Nuevo Comprobante</h1>
            <div className={Style.titleLine}></div>
          </header>

          <h2 className={Style.tituloComprobante}>
            Tipo de COMPROBANTE
          </h2>

          <div className={Style.contentBotones}>
            <button
              type="button"
              className={`${Style.buttons} ${
                tipoComprobante === 'NV' ? Style.buttonActive : ''
              }`}
              onClick={() => setTipoComprobante('NV')}
            >
              NV-NOTA DE VENTA
            </button>

            <button
              type="button"
              className={`${Style.buttons} ${
                tipoComprobante === 'B' ? Style.buttonActive : ''
              }`}
              onClick={() => setTipoComprobante('B')}
            >
              B-BOLETA
            </button>

            <button
              type="button"
              className={`${Style.buttons} ${
                tipoComprobante === 'F' ? Style.buttonActive : ''
              }`}
              onClick={() => setTipoComprobante('F')}
            >
              F-FACTURA
            </button>
          </div>

          <div className={Style.workspace}>
            <aside className={Style.sidebar}>
              <div
                className={Style.imagenInput}
                ref={contenedorRef}
              >
                <Image
                  src={Icognito}
                  alt="Cliente"
                  width={25}
                  height={25}
                  style={{ cursor: 'pointer', objectFit: 'contain' }}
                  onClick={() => {
                    setCliente('CLIENTE GENÉRICO');
                    setClienteSeleccionado(null);
                    setMostrarLista(false);
                  }}
                />

                <input
                  className={Style.inputCliente}
                  type="text"
                  placeholder="Buscar Cliente"
                  value={cliente}
                  onFocus={obtenerClientes}
                  onClick={obtenerClientes}
                  onChange={(event) => {
                    setCliente(event.target.value);
                    setClienteSeleccionado(null);
                  }}
                />

                {mostrarLista && (
                  <div className={Style.listaClientes}>
                    {clientes.length > 0 ? (
                      clientes.map((item) => (
                        <div
                          key={item.id}
                          className={Style.itemCliente}
                          onClick={() => {
                            setCliente(item.nombre);
                            setClienteSeleccionado(item);
                            setMostrarLista(false);
                          }}
                        >
                          {item.nombre} - {item.documento}
                        </div>
                      ))
                    ) : (
                      <div className={Style.itemCliente}>
                        No se encontraron clientes
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className={Style.contentBuscarProducto}
                ref={contenedorProductosRef}
              >
                <button
                  type="button"
                  onClick={obtenerProductos}
                  className={Style.buscarProducto}
                >
                  Buscar Producto
                </button>

                {mostrarProductos && (
                  <div className={Style.listaProductos}>
                    {productosBD.length > 0 ? (
                      productosBD.map((producto) => (
                        <div
                          key={producto.id}
                          className={Style.itemProducto}
                          onClick={() => agregarProducto(producto)}
                        >
                          {producto.nombre} - S/{' '}
                          {formatMoney(producto.precio_venta)}
                        </div>
                      ))
                    ) : (
                      <div className={Style.itemProducto}>
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            <main className={Style.productosSection}>
              <div className={Style.tablaWrapper}>
                <table className={Style.tabla}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>P. Unit.</th>
                      <th>Cant.</th>
                      <th>Importe</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productos.length > 0 ? (
                      productos.map((producto, index) => (
                        <tr key={producto.id}>
                          <td>
                            <span className={Style.productNameTable}>
                              {producto.nombre} - S/{' '}
                              {formatMoney(producto.precio)}
                            </span>
                          </td>

                          <td>
                            <input
                              className={Style.inputTabla}
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.precio}
                              onChange={(event) =>
                                handleChange(
                                  index,
                                  'precio',
                                  event.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              className={Style.inputTabla}
                              type="number"
                              min="1"
                              step="1"
                              value={producto.cantidad}
                              onChange={(event) =>
                                handleChange(
                                  index,
                                  'cantidad',
                                  event.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            S/{' '}
                            {formatMoney(
                              producto.precio * producto.cantidad
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className={Style.emptyTable}
                          colSpan={4}
                        >
                          Busca y agrega productos a la venta
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className={Style.btnCrear}
                onClick={crearComprobante}
              >
                CREAR COMPROBANTE
              </button>
            </main>

            <aside className={Style.resumenOrden}>
              <h2 className={Style.resumenTitulo}>
                Resumen de Orden
              </h2>

              <div className={Style.resumenProductos}>
                {productos.length > 0 ? (
                  productos.map((producto) => (
                    <div
                      className={Style.resumenFila}
                      key={`resumen-${producto.id}`}
                    >
                      <span className={Style.resumenNombre}>
                        {producto.nombre}
                      </span>

                      <span className={Style.resumenPrecio}>
                        (S/{' '}
                        {formatMoney(
                          producto.precio * producto.cantidad
                        )}{' '}
                        × {producto.cantidad})
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={Style.resumenVacio}>
                    No hay productos agregados
                  </div>
                )}
              </div>

              <div className={Style.resumenTotal}>
                <span>Total</span>
                <span>S/ {formatMoney(total)}</span>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {mostrarPreview && (
        <div className={`${Style.modalOverlay} printOverlay`}>
          <div className={`${Style.ticket} printTicket`}>
            {tipoComprobante === 'NV' && (
              <div className={Style.ticketContent}>
                <div className={Style.ticketCenter}>
                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div className={Style.ticketTitle}>
                    NOTA DE VENTA
                  </div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>10181328849</div>
                  <div>CAPRICHO&apos;S SHOP</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>TRUJILLO</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>{fechaActual}</div>
                  <div>NV01-00000094</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>
                    {(cliente || 'CLIENTE GENÉRICO').toUpperCase()}
                  </div>

                  <div>
                    {clienteSeleccionado?.documento || ''}
                  </div>

                  <div className={Style.ticketLine}>
                    ================================
                  </div>
                </div>

                <div className={Style.ticketHeader}>
                  <span>Cant</span>
                  <span>P.Und</span>
                  <span>Und</span>
                  <span>P.Total</span>
                </div>

                <div className={Style.ticketLine}>
                  ================================
                </div>

                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className={Style.ticketProduct}
                  >
                    <div className={Style.productName}>
                      {String(
                        producto.nombre || ''
                      ).toUpperCase()}
                    </div>

                    <div className={Style.ticketRow}>
                      <span>{producto.cantidad}</span>
                      <span>
                        {formatMoney(producto.precio)}
                      </span>
                      <span>NIU</span>
                      <span>
                        {formatMoney(
                          producto.precio * producto.cantidad
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketSummary}>
                  <span>Descuento Gral.</span>
                  <span>S/ {formatMoney(descuento)}</span>
                </div>

                <div className={Style.ticketSpace}></div>

                <div className={Style.ticketSummary}>
                  <span>Total</span>
                  <span>S/ {formatMoney(total)}</span>
                </div>

                <div className={Style.ticketSummary}>
                  <span>Pago</span>
                  <span>S/ {formatMoney(total)}</span>
                </div>

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketRight}>
                  CONTADO
                </div>

                <div className={Style.ticketCenter}>
                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>Atendido por:</div>
                  <div>Shop</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>SOLICITE SU COMPROBANTE EN CAJA</div>
                </div>
              </div>
            )}

            {tipoComprobante === 'B' && (
              <div className={Style.ticketContent}>
                <div className={Style.ticketCenter}>
                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div className={Style.ticketTitle}>
                    BOLETA DE VENTA ELECTRONICA
                  </div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>10181328849</div>
                  <div>CAPRICHO&apos;S SHOP</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>TRUJILLO</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>{fechaActual}</div>
                  <div>B001-00002068</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>Tipo de atencion: Directa /</div>
                  <div>Para llevar</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>
                    {(cliente || 'CLIENTE GENÉRICO').toUpperCase()}
                  </div>

                  <div>
                    {clienteSeleccionado?.documento || '00000000'}
                  </div>

                  <div className={Style.ticketLine}>
                    ================================
                  </div>
                </div>

                <div className={Style.ticketHeader}>
                  <span>Cant</span>
                  <span>P.Und</span>
                  <span>Und</span>
                  <span>P.Total</span>
                </div>

                <div className={Style.ticketLine}>
                  ================================
                </div>

                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className={Style.ticketProduct}
                  >
                    <div className={Style.productName}>
                      {String(
                        producto.nombre || ''
                      ).toUpperCase()}
                    </div>

                    <div className={Style.ticketRow}>
                      <span>{producto.cantidad}</span>
                      <span>
                        {formatMoney(producto.precio)}
                      </span>
                      <span>NIU</span>
                      <span>
                        {formatMoney(
                          producto.precio * producto.cantidad
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketSummary}>
                  <span>Op. gravada</span>
                  <span>S/ {formatMoney(opGravada)}</span>
                </div>

                <div className={Style.ticketSummary}>
                  <span>IGV(18%)</span>
                  <span>S/ {formatMoney(igv)}</span>
                </div>

                <div className={Style.ticketSummary}>
                  <span>Descuento Gral.</span>
                  <span>S/ {formatMoney(descuento)}</span>
                </div>

                <div className={Style.ticketSummary}>
                  <span>SubTotal</span>
                  <span>S/ {formatMoney(opGravada)}</span>
                </div>

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketSummary}>
                  <span>Total</span>
                  <span>S/ {formatMoney(total)}</span>
                </div>

                <div className={Style.ticketSummary}>
                  <span>Pago</span>
                  <span>S/ {formatMoney(total)}</span>
                </div>

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketRight}>
                  CONTADO
                </div>

                <div className={Style.ticketCenter}>
                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>Atendido por:</div>
                  <div>Shop</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>Gracias por su compra</div>
                  <div>Representacion impresa de</div>
                  <div>BOLETA DE VENTA ELECTRONICA</div>
                </div>
              </div>
            )}

            {tipoComprobante === 'F' && (
              <div className={Style.ticketContent}>
                <div className={Style.ticketCenter}>
                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div className={Style.ticketTitle}>
                    FACTURA
                  </div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>10181328894</div>
                  <div>CAPRICHO&apos;S SHOP</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>
                    {(cliente || 'CLIENTE GENÉRICO').toUpperCase()}
                  </div>

                  <div>
                    {clienteSeleccionado?.documento || ''}
                  </div>

                  <div className={Style.ticketLine}>
                    ================================
                  </div>
                </div>

                <div className={Style.ticketHeader}>
                  <span>Cant</span>
                  <span>P.Und</span>
                  <span>Und</span>
                  <span>P.Total</span>
                </div>

                <div className={Style.ticketLine}>
                  ================================
                </div>

                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className={Style.ticketProduct}
                  >
                    <div className={Style.productName}>
                      {String(
                        producto.nombre || ''
                      ).toUpperCase()}
                    </div>

                    <div className={Style.ticketRow}>
                      <span>{producto.cantidad}</span>
                      <span>
                        {formatMoney(producto.precio)}
                      </span>
                      <span>NIU</span>
                      <span>
                        {formatMoney(
                          producto.precio * producto.cantidad
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                <div className={Style.ticketLine}>
                  --------------------------------
                </div>

                <div className={Style.ticketSummary}>
                  <span>Total</span>
                  <span>S/ {formatMoney(total)}</span>
                </div>
              </div>
            )}

            <div className={`${Style.modalButtons} printButtons`}>
              <button
                type="button"
                className={Style.btnPrint}
                onClick={imprimir}
              >
                Imprimir
              </button>

              <button
                type="button"
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
  );
}