"use client";

import { useEffect, useState } from "react";
import Style from "./preVenta.module.css";

export default function PreVenta() {
  const [datosPreVenta, setDatosPreVenta] = useState([]);
  const [datosDetallePreVenta, setDatosDetallePreVenta] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [colores, setColores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [MPagosElegidos, setMPagosElegidos] = useState([]);
  const [procesando, setProcesando] = useState(false);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    fetch("/api/clientes").then((r) => r.json()).then(setClientes);
    fetch("/api/productos").then((r) => r.json()).then(setProductos);
    fetch("/api/tallas").then((r) => r.json()).then(setTallas);
    fetch("/api/colores").then((r) => r.json()).then(setColores);

    fetch("/api/pre-ventas")
      .then((r) => r.json())
      .then((data) =>
        setDatosPreVenta(
          data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        )
      );

    fetch("/api/detalle-pre-ventas")
      .then((r) => r.json())
      .then(setDatosDetallePreVenta);
  }, []);

  const obtenerNombreProducto = (id) =>
    productos.find((p) => p.id === id)?.nombre || "";

  const obtenerNombreTalla = (id) =>
    tallas.find((t) => t.id === id)?.nombre || "";

  const obtenerNombreColor = (id) =>
    colores.find((c) => c.id === id)?.nombre || "";

  const showNameCliente = (id) =>
    clientes.find((c) => c.id === id)?.nombre || "";

  const formatearFecha = (fechaISO) =>
    new Date(fechaISO).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const handlePagoChange = (key, metodo, checked) => {
    setMPagosElegidos((prev) => {
      const copia = { ...(prev[key] || {}) };
      checked ? (copia[metodo] = "") : delete copia[metodo];
      return { ...prev, [key]: copia };
    });
  };

  const handleMontoChange = (key, metodo, monto) => {
    setMPagosElegidos((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [metodo]: monto,
      },
    }));
  };

  const eliminarRegistro = async (id) => {
    if (procesando) return;
    if (!confirm("¿Eliminar esta pre-venta?")) return;

    setProcesando(true);
    try {
      const res = await fetch(`/api/pre-ventas/${id}`, { method: "DELETE" });

      if (!res.ok) {
        alert(" No se pudo eliminar");
        return;
      }

      setDatosPreVenta((prev) => prev.filter((v) => v.id !== id));
      setDatosDetallePreVenta((prev) => prev.filter((d) => d.preVentaId !== id));
    } finally {
      setProcesando(false);
    }
  };

  const guardarVenta = async (venta) => {
    if (procesando) return;
    setProcesando(true);

    try {
      const key = String(venta.id);
      const pagos = MPagosElegidos[key];

      if (!pagos || Object.keys(pagos).length === 0) {
        alert("Selecciona método de pago");
        return;
      }

      const sumaPagos = Object.values(pagos)
        .map((v) => Number(v) || 0)
        .reduce((a, b) => a + b, 0);

      const totalVenta = Number(venta.total);
      const totalPagos = Number(sumaPagos.toFixed(2));

      if (totalPagos !== totalVenta) {
        alert(` El total es S/${totalVenta} pero los pagos suman S/${totalPagos}`);
        return;
      }

      const detalles = datosDetallePreVenta
        .filter((d) => d.preVentaId === venta.id)
        .map((d) => ({
          productoId: d.productoId,
          colorId: d.colorId,
          tallaId: d.tallaId,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subTotal: Number(d.subTotal),
        }));

      if (detalles.length === 0) {
        alert(" Esta pre-venta no tiene detalles");
        return;
      }

      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: totalVenta,
          fecha: venta.fecha,
          metodo_de_pago: JSON.stringify(pagos),
          id_cliente: venta.clienteId,
          detalles,
          preVentaId: venta.id,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(` Error al registrar la venta: ${data?.detail || data?.details || ""}`);
        return;
      }

      setDatosPreVenta((prev) => prev.filter((v) => v.id !== venta.id));
      setDatosDetallePreVenta((prev) => prev.filter((d) => d.preVentaId !== venta.id));
      setMPagosElegidos((prev) => {
        const copy = { ...prev };
        delete copy[String(venta.id)];
        return copy;
      });

      alert(" Venta confirmada y stock actualizado");
    } catch (error) {
      console.error(error);
      alert(" Error inesperado");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={Style.contentPreVenta}>
      <h1 className={Style.tituloPreVentas}>Pre Ventas</h1>

      {isClient && window.innerWidth > 768 && (
        <table className={Style.tablaGeneral}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Productos</th>
            </tr>
          </thead>

          <tbody>
            {datosPreVenta.map((venta) => {
              const key = String(venta.id);
              return (
                <tr key={venta.id}>
                  <td>{formatearFecha(venta.fecha)}</td>
                  <td>{showNameCliente(venta.clienteId)}</td>
                  <td>S/{venta.total}</td>

                  <td>
                    <table className={Style.subTabla}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Cantidad</th>
                          <th>Talla</th>
                          <th>Color</th>
                          <th>Precio</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {datosDetallePreVenta
                          .filter((d) => d.preVentaId === venta.id)
                          .map((d, i) => (
                            <tr key={i}>
                              <td>{obtenerNombreProducto(d.productoId)}</td>
                              <td>{d.cantidad}</td>
                              <td>{obtenerNombreTalla(d.tallaId)}</td>
                              <td>{obtenerNombreColor(d.colorId)}</td>
                              <td>S/{d.precioUnitario}</td>
                              <td>S/{d.subTotal}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    <div className={Style.contentMetodoAddDelete}>
                      {/* <div className={Style.metodoPago}>
                        <h3>Método de pago:</h3>

                        {["Yape", "Tarjeta", "Efectivo"].map((metodo) => (
                          <div key={metodo}>
                            <label>
                              <input
                                type="checkbox"
                                checked={MPagosElegidos[key]?.[metodo] !== undefined}
                                onChange={(e) =>
                                  handlePagoChange(key, metodo, e.target.checked)
                                }
                              />
                              {metodo}
                            </label>

                            {MPagosElegidos[key]?.[metodo] !== undefined && (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={MPagosElegidos[key][metodo]}
                                onChange={(e) =>
                                  handleMontoChange(key, metodo, e.target.value)
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div> */}

                      <div className={Style.metodoPago}>
                        <span className={Style.tituloMetodo}>Método de pago:</span>

                        <div className={Style.opcionesPago}>
                          {["Yape", "Tarjeta", "Efectivo"].map((metodo) => (
                            <div key={metodo} className={Style.opcionPago}>
                              
                              <label className={Style.labelPago}>
                                <input
                                  type="checkbox"
                                  checked={MPagosElegidos[key]?.[metodo] !== undefined}
                                  onChange={(e) =>
                                    handlePagoChange(key, metodo, e.target.checked)
                                  }
                                />
                                {metodo}
                              </label>

                              {MPagosElegidos[key]?.[metodo] !== undefined && (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="S/"
                                  className={Style.inputMonto}
                                  value={MPagosElegidos[key][metodo]}
                                  onChange={(e) =>
                                    handleMontoChange(key, metodo, e.target.value)
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={Style.accionesPreVenta}>
                        <button
                          disabled={procesando}
                          onClick={() => guardarVenta(venta)}
                          title="Confirmar venta"
                        >
                          ✔
                        </button>
                        <button
                          disabled={procesando}
                          onClick={() => eliminarRegistro(venta.id)}
                          title="Eliminar preventa"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {isClient && window.innerWidth <= 768 && (
        <div className={Style.ventaCardContainer}>
          {datosPreVenta.map((venta) => (
            <div key={venta.id} className={Style.ventaCard}>
              <h3>Fecha: {formatearFecha(venta.fecha)}</h3>
              <div className={Style.detalle}>
                <label>Cliente:</label>
                <span>{showNameCliente(venta.clienteId)}</span>
              </div>
              <div className={Style.detalle}>
                <label>Total:</label>
                <span>S/{venta.total}</span>
              </div>

              <div className={Style.detalle}>
                <h4>Productos:</h4>
                {datosDetallePreVenta
                  .filter((d) => d.preVentaId === venta.id)
                  .map((d, i) => (
                    <div key={i} className={Style.detalle}>
                      <span>{obtenerNombreProducto(d.productoId)} - Cantidad: {d.cantidad} - Talla: {obtenerNombreTalla(d.tallaId)} - Color: {obtenerNombreColor(d.colorId)} - Precio: S/{d.precioUnitario}</span>
                    </div>
                  ))}
              </div>

              <div className={Style.metodoPago}>
                <h4>Método de pago:</h4>
                {["Yape", "Tarjeta", "Efectivo"].map((metodo) => (
                  <div key={metodo}>
                    <label>
                      <input
                        type="checkbox"
                        checked={MPagosElegidos[String(venta.id)]?.[metodo] !== undefined}
                        onChange={(e) => handlePagoChange(String(venta.id), metodo, e.target.checked)}
                      />
                      {metodo}
                    </label>

                    {MPagosElegidos[String(venta.id)]?.[metodo] !== undefined && (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={MPagosElegidos[String(venta.id)][metodo]}
                        onChange={(e) => handleMontoChange(String(venta.id), metodo, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className={Style.accionesPreVenta}>
                <button disabled={procesando} onClick={() => guardarVenta(venta)} title="Confirmar venta">
                  ✔
                </button>
                <button disabled={procesando} onClick={() => eliminarRegistro(venta.id)} title="Eliminar preventa">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}