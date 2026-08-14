'use client';

import Style from './Post.module.css';
import Image from 'next/image';
import Icognito from '../../public/images/icognito.png';
import { useEffect, useRef, useState } from 'react';

import { Trash2 } from 'lucide-react';

export default function Post() {
  const contenedorRef = useRef(null);
  const contenedorProductosRef = useRef(null);

  const [cliente, setCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(false);

  const [productosBD, setProductosBD] = useState([]);
  const [mostrarProductos, setMostrarProductos] = useState(false);

  const [productos, setProductos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");

  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [buscarProducto, setBuscarProducto] = useState("");

  const [ventaPreview, setVentaPreview] = useState(null);

  const [metodosPago, setMetodosPago] = useState({
    Yape:"",
    Tarjeta:"",
    Efectivo:""
  });

  const [tipoComprobante, setTipoComprobante] = useState('NV');
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const [creandoComprobante, setCreandoComprobante] = useState(false);
  const creandoComprobanteRef = useRef(false);

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
    try {
      const res = await fetch("/api/clientes", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudieron obtener los clientes");
      }

      const data = await res.json();

      setClientes(data);
      setMostrarLista(true);

    } catch (error) {
      console.error(error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch("/api/productos", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudieron obtener los productos");
      }

      const data = await res.json();

      setProductosBD(data);
      setMostrarProductos(true);

    } catch (error) {
      console.error(error);
    }
  };

const obtenerVariantes = async () => {
  try {
    const res = await fetch("/api/variantes", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudieron obtener las variantes");
    }

    const data = await res.json();

    setVariantes(
      data.map((v) => ({
        ...v,
        id: Number(v.id),
        productoId: Number(v.productoId),
        colorId: Number(v.colorId),
        tallaId: Number(v.tallaId),
        stock: Number(v.stock),
      }))
    );

  } catch (error) {
    console.error("ERROR OBTENIENDO VARIANTES:", error);
  }
};


const obtenerColores = async () => {
  try {
    const res = await fetch("/api/colores", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudieron obtener los colores");
    }

    const data = await res.json();

    setColores(
      data.map((color) => ({
        ...color,
        id: Number(color.id),
      }))
    );

  } catch (error) {
    console.error("ERROR OBTENIENDO COLORES:", error);
  }
};


const obtenerTallas = async () => {
  try {
    const res = await fetch("/api/tallas", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudieron obtener las tallas");
    }

    const data = await res.json();

    setTallas(
      data.map((talla) => ({
        ...talla,
        id: Number(talla.id),
      }))
    );

  } catch (error) {
    console.error("ERROR OBTENIENDO TALLAS:", error);
  }
};

 const seleccionarProducto = (producto)=>{
  setProductoSeleccionado(producto);
  setColorSeleccionado("");
  setTallaSeleccionada("");
  setCantidadSeleccionada(1);
  setMostrarProductos(false);

  setBuscarProducto("");
  setMostrarProductos(false);
};

const agregarProductoFinal = ()=>{

  if(!productoSeleccionado){
    alert("Selecciona un producto");
    return;
  }

  if(!colorSeleccionado || !tallaSeleccionada){
    alert("Selecciona color y talla");
    return;
}

const variante = variantes.find(
  (v) =>
    Number(v.productoId) === Number(productoSeleccionado.id) &&
    Number(v.colorId) === Number(colorSeleccionado) &&
    Number(v.tallaId) === Number(tallaSeleccionada)
);

if(!variante){
 alert("No existe esa combinación");
 return;
}

if(variante.stock < cantidadSeleccionada){
 alert("Stock insuficiente");
 return;
}

const nuevoProducto={
 productoId:productoSeleccionado.id,
 varianteId:variante.id,
 nombre:productoSeleccionado.nombre,
 precio:Number(productoSeleccionado.precioVenta),
 cantidad:Number(cantidadSeleccionada),
 total:
 Number(productoSeleccionado.precioVenta) *
 Number(cantidadSeleccionada)
};

setProductos([
 ...productos,
 nuevoProducto
]);

setProductoSeleccionado(null);
setColorSeleccionado("");
setTallaSeleccionada("");
setCantidadSeleccionada(1);
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

  const eliminarProducto = (index) => {
    setProductos((productosActuales) =>
      productosActuales.filter((_, productoIndex) => productoIndex !== index)
    );
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

        setProductoSeleccionado(null);
        setColorSeleccionado("");
        setTallaSeleccionada("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    obtenerVariantes();
    obtenerColores();
    obtenerTallas();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const imprimir = () => {
    window.print();
  };

  const crearComprobante = async () => {
    if (creandoComprobanteRef.current) {
      return;
    }

    if (productos.length === 0) {
      alert("Agrega productos");
      return;
    }

    const pagosSeleccionados = {};

    Object.entries(metodosPago).forEach(([key, value]) => {
      if (Number(value) > 0) {
        pagosSeleccionados[key] = Number(value);
      }
    });

    if (Object.keys(pagosSeleccionados).length === 0) {
      alert("Selecciona método de pago");
      return;
    }

    const totalPagado = Object.values(pagosSeleccionados).reduce(
      (acc, val) => acc + Number(val),
      0
    );

    if (Math.abs(totalPagado - total) > 0.01) {
      alert("El total pagado no coincide con el total de la venta");
      return;
    }

    creandoComprobanteRef.current = true;
    setCreandoComprobante(true);

    try {
      const detalles = productos.map((p) => ({
        productoId: p.productoId,
        varianteId: p.varianteId,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        total: p.total
      }));

      const respuesta = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          fecha: new Date(),
          total,
          metodo_de_pago: JSON.stringify(pagosSeleccionados),
          id_cliente: clienteSeleccionado?.id ?? 16,
          tipoComprobante,
          preVentaId: null,
          detalles
        })
      });
      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.detail || data.error || "Error");
        return;
      }

      const ventaId = data.ventaId;
      console.log("VENTA CREADA:", ventaId);

      if (tipoComprobante === "B") {
        const respuestaBoleta = await fetch(
          `/api/ventas/${ventaId}/boleta`,
          {
            method: "POST",
          }
        );

        const dataBoleta = await respuestaBoleta.json();

        console.log("RESPUESTA BOLETA LUCODE:", dataBoleta);

        if (!respuestaBoleta.ok) {
          alert(
            dataBoleta.detail ||
            dataBoleta.error ||
            "La venta se registró, pero la boleta no pudo emitirse"
          );

          return;
        }

        console.log("BOLETA EMITIDA CORRECTAMENTE:", dataBoleta);
      }

      const resVariantes = await fetch("/api/variantes", {
        cache: "no-store"
      });

      if (resVariantes.ok) {
        const variantesActualizadas = await resVariantes.json();
        setVariantes(variantesActualizadas);
      }

      setVentaPreview({
        cliente,
        clienteSeleccionado,
        productos,
        metodosPago,
        total,
        fechaActual,
        tipoComprobante
      });

      alert("Venta registrada correctamente");
      setMostrarPreview(true);
      limpiarFormulario();

    } catch (error) {

      console.error("ERROR CREANDO COMPROBANTE:", error);
      alert("Ocurrió un error al registrar la venta");

    } finally {
      creandoComprobanteRef.current = false;
      setCreandoComprobante(false);
    }
  };

  const cambiarMetodoPago=(metodo,valor)=>{
    setMetodosPago({
      ...metodosPago,
      [metodo]:valor
    });
  };

  const productosFiltrados = productosBD.filter((producto) => {
    const texto = buscarProducto.toLowerCase();

    const tieneVariantes = variantes.some(
      (v) =>
        Number(v.productoId) === Number(producto.id) &&
        v.colorId &&
        v.tallaId
    );

    return (
      tieneVariantes &&
      (
        producto.nombre.toLowerCase().includes(texto) ||
        producto.marca?.nombre?.toLowerCase().includes(texto)
      )
    );
  });

  const varianteSeleccionada =
  productoSeleccionado && colorSeleccionado && tallaSeleccionada
    ? variantes.find(
        (v) =>
          Number(v.productoId) === Number(productoSeleccionado.id) &&
          Number(v.colorId) === Number(colorSeleccionado) &&
          Number(v.tallaId) === Number(tallaSeleccionada)
      )
    : null;

  const sinStock =
    varianteSeleccionada &&
    varianteSeleccionada.stock <= 0;

  const limpiarFormulario = () => {
    // Cliente
    setCliente("");
    setClienteSeleccionado(null);
    setClientes([]);
    setMostrarLista(false);

    // Productos agregados
    setProductos([]);

    // Buscador de productos
    setBuscarProducto("");
    setMostrarProductos(false);
    setProductosBD([]);

    // Producto seleccionado
    setProductoSeleccionado(null);
    setColorSeleccionado("");
    setTallaSeleccionada("");
    setCantidadSeleccionada(1);

    // Métodos de pago
    setMetodosPago({
      Yape: "",
      Tarjeta: "",
      Efectivo: ""
    });

    // Tipo de comprobante
    setTipoComprobante("NV");
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

            {/* BOTON DE PROBAR LUCODE */}
            {/* <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/lucode/test", {
                  method: "POST"
                });

                const data = await res.json();

                console.log("RESULTADO TEST LUCODE:", data);

                alert(JSON.stringify(data, null, 2));
              }}
            >
              PROBAR LUCODE
            </button> */}
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

                {productoSeleccionado && (
                  <div className={Style.selectorVariante}>
                    <div className={Style.productoHeader}>
                        <span className={Style.productoLabel}>Producto</span>

                        <h3 className={Style.productoNombre}>
                            {productoSeleccionado.nombre}
                        </h3>
                    </div>

                    <div className={Style.formGroup}>
                        <label>Color</label>

                        <select
                            className={Style.selectVariante}
                            value={colorSeleccionado}
                            onChange={(e)=>{
                                setColorSeleccionado(e.target.value);
                                setTallaSeleccionada("");
                            }}
                        >
                            <option value="">Seleccione un color</option>

                            {
                                colores
                                .filter((c) =>
                                  variantes.some(
                                    (v) =>
                                      Number(v.productoId) === Number(productoSeleccionado.id) &&
                                      Number(v.colorId) === Number(c.id)
                                  )
                                )
                                .map(color=>(
                                    <option
                                        key={color.id}
                                        value={color.id}
                                    >
                                        {color.nombre}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className={Style.formGroup}>
                        <label>Talla</label>

                        <select
                            className={Style.selectVariante}
                            value={tallaSeleccionada}
                            onChange={(e)=>setTallaSeleccionada(e.target.value)}
                        >
                            <option value="">Seleccione una talla</option>

                            {
                              colorSeleccionado &&
                              tallas
                              .filter((t) =>
                                variantes.some(
                                  (v) =>
                                    Number(v.productoId) === Number(productoSeleccionado.id) &&
                                    Number(v.colorId) === Number(colorSeleccionado) &&
                                    Number(v.tallaId) === Number(t.id)
                                )
                              )
                              .map(talla=>(
                                  <option
                                      key={talla.id}
                                      value={talla.id}
                                  >
                                      {talla.nombre}
                                  </option>
                              ))
                            }
                        </select>
                    </div>

                    {varianteSeleccionada && (
                    <>
                      {varianteSeleccionada.stock > 0 ? (
                        <>
                            <div className={Style.formGroup}>
                              <label>
                                  Cantidad (Stock: {varianteSeleccionada.stock})
                              </label>

                                <input
                                  className={Style.inputCantidad}
                                  type="number"
                                  min="1"
                                  max={varianteSeleccionada.stock}
                                  value={cantidadSeleccionada}
                                  onChange={(e) => {
                                    const valor = e.target.value;

                                    if (valor === "") {
                                      setCantidadSeleccionada("");
                                      return;
                                    }

                                    const cantidad = Number(valor);

                                    if (cantidad < 1) {
                                      setCantidadSeleccionada(1);
                                      return;
                                    }

                                    setCantidadSeleccionada(
                                      Math.min(cantidad, varianteSeleccionada.stock)
                                    );
                                  }}
                                />
                            </div>

                            <button
                                type="button"
                                className={Style.btnAgregarProducto}
                                onClick={agregarProductoFinal}
                                disabled={
                                    cantidadSeleccionada < 1 ||
                                    cantidadSeleccionada > varianteSeleccionada.stock
                                }
                            >
                                Agregar producto
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={Style.formGroup}>
                                <span>Sin stock disponible</span>
                            </div>

                            <button
                                type="button"
                                className={Style.btnAgregarProducto}
                                disabled
                            >
                                Sin stock
                            </button>
                        </>
                      )}
                    </>
                )}
                  </div>
                  )}

                {mostrarProductos && (
                  <>
                  <input
                    type="text"
                    className={Style.inputBuscarProducto}
                    placeholder="🔍"
                    value={buscarProducto}
                    onChange={(e) => setBuscarProducto(e.target.value)}
                  />

                  <div className={Style.listaProductos}>
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          className={Style.itemProducto}
                          onClick={() => seleccionarProducto(producto)}
                        >
                          {producto.nombre} - {producto?.marca?.nombre} - S/{formatMoney(producto.precioVenta)}
                        </div>
                      ))
                    ) : (
                      <div className={Style.sinResultados}>
                        No se encontraron productos.
                      </div>
                    )}
                  </div>
                </>
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
                      <th>Eliminar</th>
                    </tr>
                  </thead>

                  <tbody>
                  {productos.length > 0 ? (
                    productos.map((producto, index) => (
                      <tr key={producto.varianteId}>
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

                        <td className={Style.importe}>
                          S/{' '}
                          {formatMoney(
                            producto.precio * producto.cantidad
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => eliminarProducto(index)}
                            title="Eliminar producto"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className={Style.emptyTable}
                        colSpan={5}
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
                disabled={creandoComprobante}
              >
                {creandoComprobante
                ? 'ENVIANDO COMPROBANTE...'
                : 'CREAR COMPROBANTE'}
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

              <div className={Style.metodosPago}>
                <h3>
                  Método de pago
                </h3>
                {
                ["Yape","Tarjeta","Efectivo"].map((metodo)=>(

                <div key={metodo}>
                <label>
                  {metodo}
                </label>

                <input
                  type="number"
                  className={Style.inputMetodoPago}
                  min="0"
                  placeholder="S/"
                  value={metodosPago[metodo]}
                  onChange={(e)=>
                  cambiarMetodoPago(
                  metodo,
                  e.target.value
                  )
                  }
                />
                </div>
                ))
                }
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
            {ventaPreview?.tipoComprobante === 'NV' && (
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

                  <div>CAPRICHO&apos;S SHOP</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>TRUJILLO</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>{ventaPreview?.fechaActual}</div>
                  <div>NV01-00000094</div>

                  <div className={Style.ticketLine}>
                    --------------------------------
                  </div>

                  <div>
                    {(ventaPreview?.cliente || 'CLIENTE GENÉRICO').toUpperCase()}
                  </div>

                  <div>
                    {ventaPreview?.clienteSeleccionado?.documento || ''}
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

                {ventaPreview?.productos.map((producto) => (
                  <div
                    key={producto.varianteId}
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
                  <span>S/ {formatMoney(ventaPreview?.total)}</span>
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

            {ventaPreview?.tipoComprobante === 'B' && (
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

            {ventaPreview?.tipoComprobante === 'F' && (
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