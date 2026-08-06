"use client";

import Style from "./notaVentaPrint.module.css";

export default function NotaVentaPrint({
  venta,
  detalles = [],
  showNameCliente,
  obtenerNombreProducto,
  obtenerNombreTallaPorVariante,
  obtenerNombreColorPorVariante,
  cerrarModal,
}) {
  const handlePrint = () => {
    window.print();
  };

  if (!venta) return null;

  return (
    <div className={Style.modalOverlay}>
      <div className={Style.ticket}>
        <div className={Style.ticketContent}>
          <div className={Style.ticketCenter}>
            <div className={Style.ticketLine}>------------------------------</div>

            <div className={Style.ticketTitle}>NOTA DE VENTA</div>

            <div className={Style.ticketLine}>------------------------------</div>

            <div>CAPRICHO&apos;S SHOP</div>

            <div className={Style.ticketLine}>------------------------------</div>

            <div>TRUJILLO</div>

            <div className={Style.ticketLine}>------------------------------</div>

            <div>
              {new Date(venta.fecha).toLocaleString("es-PE", {
                timeZone: "America/Lima",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
            </div>

            <div>{venta.numeroVenta}</div>

            <div className={Style.ticketLine}>------------------------------</div>

            <div>{showNameCliente(venta.clienteId).toUpperCase()}</div>

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

          {detalles.map((item, index) => (
            <div key={index} className={Style.ticketProduct}>
              <div className={Style.productName}>
                {obtenerNombreProducto(item.productoId).toUpperCase()}
              </div>

              <div className={Style.ticketRow}>
                <span>{item.cantidad}</span>
                <span>{Number(item.precioUnitario).toFixed(2)}</span>
                <span>NIU</span>
                <span>{Number(item.total).toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div className={Style.ticketLine}>------------------------------</div>

          <div className={Style.ticketSummary}>
            <span>Descuento Gral.</span>
            <span>S/ 0.00</span>
          </div>

          <div className={Style.ticketSummary}>
            <span>Total</span>
            <span>S/ {Number(venta.total).toFixed(2)}</span>
          </div>

          <div className={Style.ticketSummary}>
            <span>Pago</span>
            <span>S/ {Number(venta.total).toFixed(2)}</span>
          </div>

          <div className={Style.ticketLine}>------------------------------</div>

          <div className={Style.ticketPago}>CONTADO</div>

          <div className={Style.ticketLine}>------------------------------</div>

          <div className={Style.ticketFooter}>
            <div className={Style.ticketAtendido}>
              Atendido por: {venta.usuario}
            </div>
             <div className={Style.ticketAtendido}>
              Shop
            </div>
          </div>

          <div className={Style.ticketLine}>------------------------------</div>

          <div className={Style.ticketFooter}>
            SOLICITE SU COMPROBANTE EN CAJA
          </div>
        </div>

        <div className={`${Style.modalButtons} printButtons`}>
          <button
            type="button"
            className={Style.btnPrint}
            onClick={handlePrint}
          >
            Imprimir
          </button>

          <button
            type="button"
            className={Style.btnClose}
            onClick={cerrarModal}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
