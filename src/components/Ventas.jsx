"use client";

import React, { useEffect, useMemo, useState } from "react";
import Style from "./venta.module.css";

import GraficoTopProductos from "./GraficoTopProductos";
import MetodoPagoGrafico from "./MetodoPagoGrafico";
import GraficoLinealProducto from "./GraficoLinealProducto";
import NotaVentaPrint from "./NotaVentaPrint";

export default function Ventas({
  datosVenta = [],
  datosDetalleVenta = [],
  productos = [],
  tallas = [],
  colores = [],
  clientes = [],
  variantes = [],
}) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState("");
  const [montoDelDia, setMontoDelDia] = useState(0);
  const [gananciaLiquida, setGananciaLiquida] = useState(0);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    const hoy = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Lima",
    });
    setFechaInicio(hoy);
    setFechaFin(hoy);
  }, []);

  const obtenerNombreProducto = (id) =>
    productos.find(p => Number(p.id) === Number(id))?.nombre || "";

  const obtenerPrecioCompra = id =>
    productos.find(p => p.id === id)?.precioCompra || 0;

  const showNameCliente = id =>
    clientes.find(c => c.id === id)?.nombre || "";

  const obtenerVariante = id =>
    variantes.find(v => v.id === id);

  const obtenerNombreTallaPorVariante = varianteId => {
    const variante = obtenerVariante(varianteId);
    return tallas.find(t => t.id === variante?.tallaId)?.nombre || "-";
  };

  const obtenerNombreColorPorVariante = varianteId => {
    const variante = obtenerVariante(varianteId);
    return colores.find(c => c.id === variante?.colorId)?.nombre || "-";
  };

  const ventasFiltradas = useMemo(() => {
    return datosVenta
      .filter(v => {
        const fechaVenta = new Date(v.fecha).getTime();
        const desde = new Date(fechaInicio + "T00:00:00").getTime();
        const hasta = new Date(fechaFin + "T23:59:59").getTime();

        const metodoOK =
          !metodoSeleccionado ||
          v.metodoDePago?.includes(metodoSeleccionado);

        return fechaVenta >= desde && fechaVenta <= hasta && metodoOK;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [datosVenta, fechaInicio, fechaFin, metodoSeleccionado]);

  useEffect(() => {
    let total = 0;
    ventasFiltradas.forEach(v => {
      try {
        const metodos = JSON.parse(v.metodoDePago);
        if (metodoSeleccionado) {
          total += Number(metodos[metodoSeleccionado] || 0);
        } else {
          Object.values(metodos).forEach(m => (total += Number(m)));
        }
      } catch {}
    });
    setMontoDelDia(total);
  }, [ventasFiltradas, metodoSeleccionado]);

  useEffect(() => {
    let total = 0;
    ventasFiltradas.forEach(venta => {
      datosDetalleVenta
        .filter(d => d.ventaId === venta.id)
        .forEach(d => {
          const compra = obtenerPrecioCompra(d.productoId);
          total += (d.precioUnitario - compra) * d.cantidad;
        });
    });
    setGananciaLiquida(total);
  }, [ventasFiltradas, datosDetalleVenta, productos]);

  return (
    <div className={Style.contentPreVenta}>
      <h1 className={Style.tituloPreVentas}>Ventas</h1>

      <div className={Style.filtrosFechas}>
        <label>
          Desde:
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </label>
        <label>
          Hasta:
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </label>
      </div>

      <div className={Style.filtroMetodosDePago}>
        {["Yape", "Tarjeta", "Efectivo"].map(m => (
          <label key={m}>
            <input
              type="radio"
              name="metodo"
              value={m}
              checked={metodoSeleccionado === m}
              onChange={e => setMetodoSeleccionado(e.target.value)}
            />
            {m}
          </label>
        ))}

        <label>
          <input
            type="radio"
            name="metodo"
            value=""
            checked={metodoSeleccionado === ""}
            onChange={() => setMetodoSeleccionado("")}
          />
          Todos
        </label>

        <span>MONTO DEL DÍA: S/ {montoDelDia}</span>
        <span>GANANCIA LÍQUIDA: S/ {gananciaLiquida.toFixed(2)}</span>
      </div>

      <GraficoTopProductos
        ventasFiltradas={ventasFiltradas}
        datosDetalleVenta={datosDetalleVenta}
        productos={productos}
      />

      <MetodoPagoGrafico ventasFiltradas={ventasFiltradas} />

      <GraficoLinealProducto
        productos={productos}
        detalleVentas={datosDetalleVenta}
        ventasFiltradas={ventasFiltradas}
      />

      <table className={Style.tablaGeneral}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Método</th>
            <th>Productos</th>
            <th>Nota</th>
          </tr>
        </thead>

        <tbody>
          {ventasFiltradas.map(v => (
            <tr key={v.id}>
              <td>
                {new Date(v.fecha).toLocaleString("es-PE", {
                  timeZone: "America/Lima",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}
              </td>

              <td>{showNameCliente(v.clienteId)}</td>
              <td>S/{v.total}</td>
              <td>{v.metodoDePago}</td>
              <td>
                {datosDetalleVenta
                  .filter(d => d.ventaId === v.id)
                  .map((d, i) => (
                    <div key={i} className={Style.productoDesktop}>
                      <div className={Style.productoDesktopNombre}>
                        {obtenerNombreProducto(d.productoId)}
                      </div>

                      <div className={Style.productoDesktopGrid}>
                        <span><b>Cant:</b> {d.cantidad}</span>
                        <span><b>Talla:</b> {obtenerNombreTallaPorVariante(d.varianteId)}</span>
                        <span><b>Color:</b> {obtenerNombreColorPorVariante(d.varianteId)}</span>
                        <span><b>Precio:</b> S/{d.precioUnitario}</span>
                        <span><b>Total:</b> S/{d.total}</span>
                      </div>
                    </div>
                  ))}
              </td>

              <td>
                <button onClick={() => setVentaSeleccionada(v)}>
                  Generar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={Style.ventasMobile}>
        {ventasFiltradas.map(v => (
          <div key={v.id} className={Style.ventaCard}>
            <div className={Style.ventaHeader}>
              {new Date(v.fecha).toLocaleString("es-PE", {
                timeZone: "America/Lima",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
            </div>

            <div className={Style.ventaRow}><span>Cliente</span><span>{showNameCliente(v.clienteId)}</span></div>
            <div className={Style.ventaRow}><span>Total</span><strong>S/{v.total}</strong></div>
            <div className={Style.ventaRow}><span>Método</span><span>{v.metodoDePago}</span></div>

            <div className={Style.productosVenta}>
              {datosDetalleVenta
                .filter(d => d.ventaId === v.id)
                .map((d, i) => (
                  <div key={i} className={Style.productoCard}>
                    <div className={Style.productoNombre}>
                      {obtenerNombreProducto(d.productoId)}
                    </div>

                    <div className={Style.productoFila}>
                      <span>Cantidad</span>
                      <span>{d.cantidad}</span>
                    </div>

                    <div className={Style.productoFila}>
                      <span>Talla</span>
                      <span>{obtenerNombreTallaPorVariante(d.varianteId)}</span>
                    </div>

                    <div className={Style.productoFila}>
                      <span>Color</span>
                      <span>{obtenerNombreColorPorVariante(d.varianteId)}</span>
                    </div>

                    <div className={Style.productoFila}>
                      <span>Precio</span>
                      <span>S/{d.precioUnitario}</span>
                    </div>

                    <div className={Style.productoFilaTotal}>
                      <span>Total</span>
                      <strong>S/{d.total}</strong>
                    </div>
                  </div>
                ))}
            </div>

            <button
              className={Style.btnNotaDeVenta}
              onClick={() => setVentaSeleccionada(v)}
            >
              Generar Nota
            </button>
          </div>
        ))}
      </div>

      {ventaSeleccionada && (
        <NotaVentaPrint
          venta={ventaSeleccionada}
          detalles={datosDetalleVenta.filter(
            d => d.ventaId === ventaSeleccionada.id
          )}
          showNameCliente={showNameCliente}
          obtenerNombreProducto={obtenerNombreProducto}
          obtenerNombreTallaPorVariante={obtenerNombreTallaPorVariante}
          obtenerNombreColorPorVariante={obtenerNombreColorPorVariante}
          cerrarModal={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  );
}