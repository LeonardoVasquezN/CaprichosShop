"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import Style from "./carrito.module.css";
import { useCarritoStore } from "@/store/CarritoStore";
import { useUsuarioStore } from "@/store/UsuarioStore";

export default function Carrito() {
  const productos = useCarritoStore((s) => s.productos);
  const eliminarProducto = useCarritoStore((s) => s.eliminarProducto);
  const actualizarProducto = useCarritoStore((s) => s.actualizarProducto);
  const vaciarCarrito = useCarritoStore((s) => s.vaciarCarrito);
  const cerrarCarrito = useCarritoStore((s) => s.cerrarCarrito);

  const usuario = useUsuarioStore((s) => s.usuario);

  const [valueCliente, setValueCliente] = useState("");
  const [valueDniRuc, setValueDniRuc] = useState("");

  const [clientes, setClientes] = useState([]);
  const [procesando, setProcesando] = useState(false);

  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [precioTemp, setPrecioTemp] = useState("");

  const subTotal = productos.reduce(
    (total, p) => total + Number(p.precio) * Number(p.cantidad),
    0
  );

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then(setClientes)
      .catch(console.error);
  }, []);

  const handleRegistrarPreVenta = async () => {
    if (procesando) return;
    setProcesando(true);

    try {
      if (!valueCliente || !valueDniRuc) {
        alert("Debe ingresar cliente y DNI/RUC");
        return;
      }

      let cliente = clientes.find((c) => c.documento === valueDniRuc);

      if (!cliente) {
        const resCliente = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: valueCliente,
            documento: valueDniRuc,
          }),
        });

        if (!resCliente.ok) return alert("Error al crear cliente");
        cliente = await resCliente.json();
      }

      const datosProductos = productos.map((p) => ({
        producto_id: p.producto_id,
        talla_id: p.talla_id,
        color_id: p.color_id,
        cantidad: Number(p.cantidad),
        precio_unitario: Number(p.precio),
        sub_total: Number(p.precio) * Number(p.cantidad),
      }));

      const total = datosProductos.reduce((acc, p) => acc + p.sub_total, 0);

      const resPreVenta = await fetch("/api/pre-ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos: datosProductos,
          total,
          id_cliente: cliente.id,
        }),
      });

      if (!resPreVenta.ok) return alert("Error al registrar");

      alert("Pre-venta registrada");
      vaciarCarrito();
      cerrarCarrito();
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={Style.contenedorCarrito}>
      {/* HEADER */}
      <div className={Style.header}>
        <Image
          src="/images/caprichosLogoT.png"
          alt="Logo"
          width={130}
          height={30}
        />
        <button onClick={cerrarCarrito} className={Style.btnCerrar}>
          ✕
        </button>
      </div>

      <h2 className={Style.titulo}>Carrito de Compras</h2>

      {/* CLIENTE */}
      <div className={Style.form}>
        <input
          placeholder="Ingrese Nombre"
          value={valueCliente}
          onChange={(e) => setValueCliente(e.target.value)}
        />
        <input
          placeholder="DNI / RUC"
          value={valueDniRuc}
          onChange={(e) => setValueDniRuc(e.target.value)}
        />
      </div>

      {/* PRODUCTOS */}
      <div className={Style.lista}>
        {productos.map((p, i) => (
          <div key={i} className={Style.card}>
            <Image
              src={p.imagen || "/images/placeholder.jpg"}
              width={60}
              height={60}
              alt={p.nombre}
              className={Style.img}
            />

            <div className={Style.info}>
              <p className={Style.nombre}>{p.nombre}</p>

              <div className={Style.detalles}>
                <span>Talla: {p.talla}</span>
                <span>Color: {p.color}</span>

                {editandoPrecio === i ? (
                  <input
                    type="number"
                    value={precioTemp}
                    autoFocus
                    onChange={(e) => setPrecioTemp(e.target.value)}
                    onBlur={() => {
                      actualizarProducto(i, {
                        ...p,
                        precio: Number(precioTemp),
                      });
                      setEditandoPrecio(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        actualizarProducto(i, {
                          ...p,
                          precio: Number(precioTemp),
                        });
                        setEditandoPrecio(null);
                      }
                    }}
                    className={Style.inputPrecio}
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      setEditandoPrecio(i);
                      setPrecioTemp(p.precio);
                    }}
                    className={Style.precioEditable}
                  >
                    PU: S/. {p.precio}
                  </span>
                )}
              </div>

              <div className={Style.bottom}>
                <input
                  type="number"
                  min="1"
                  value={p.cantidad}
                  onChange={(e) =>
                    actualizarProducto(i, {
                      ...p,
                      cantidad: Number(e.target.value),
                    })
                  }
                  className={Style.inputCantidad}
                />

                <span className={Style.subtotal}>
                  S/. {(p.precio * p.cantidad).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => eliminarProducto(i)}
              className={Style.delete}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className={Style.total}>
        <span>Total a pagar</span>
        <strong>S/. {subTotal.toFixed(2)}</strong>
      </div>

      {/* BOTÓN */}
      {usuario && (
        <div className={Style.acciones}>
          <button
            className={Style.btnComprar}
            onClick={handleRegistrarPreVenta}
            disabled={procesando}
          >
            {procesando ? "Guardando..." : "Proceder →"}
          </button>
        </div>
      )}
    </div>
  );
}