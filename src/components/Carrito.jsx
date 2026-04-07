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

  const [productoEditandoCantidad, setProductoEditandoCantidad] = useState(null);
  const [productoEditandoPrecio, setProductoEditandoPrecio] = useState(null);

  const [valueCliente, setValueCliente] = useState("");
  const [valueDniRuc, setValueDniRuc] = useState("");

  const [clientes, setClientes] = useState([]);

  const [procesando, setProcesando] = useState(false);

  const puedeEditar =
    usuario &&
    ["Administrador", "Vendedora", "administrador", "vendedor"].includes(
      usuario.cargo
    );

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

  const handleCantidadChange = (index, value) => {
    actualizarProducto(index, {
      ...productos[index],
      cantidad: value,
    });
  };

  const handlePrecioChange = (index, value) => {
    actualizarProducto(index, {
      ...productos[index],
      precio: value,
    });
  };

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

        if (!resCliente.ok) {
          alert("Error al crear cliente");
          return;
        }

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

      const total = datosProductos.reduce(
        (acc, p) => acc + p.sub_total,
        0
      );

      const resPreVenta = await fetch("/api/pre-ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos: datosProductos,
          total,
          id_cliente: cliente.id,
        }),
      });

      if (!resPreVenta.ok) {
        alert("Error al registrar la pre-venta");
        return;
      }

      alert(" Pre-venta registrada correctamente");
      vaciarCarrito();
      cerrarCarrito();
    } catch (error) {
      console.error(error);
      alert(" Error de conexión");
    } finally {
      setProcesando(false); 
    }
  };

  return (
    <div className={Style.contenedorCarrito}>
      {/* LOGO */}
      <Image
        src="/images/caprichosLogoT.png"
        className={Style.fotoLogo}
        alt="Logo"
        width={130}
        height={30}
      />

      <div className={Style.topCarrito}>
        <h1 className={Style.titulo}>Carrito de Compras</h1>
        <button className={Style.estilobtnCerrar} onClick={cerrarCarrito}>
          X
        </button>
      </div>

      {/* CLIENTE */}
      <div className={Style.contentClienteDNI}>
        <div>
          <span className={Style.textNameClient}>Cliente:</span>
          <input
            className={Style.inputNameClient}
            value={valueCliente}
            onChange={(e) => setValueCliente(e.target.value)}
          />
        </div>
        <div className={Style.contentDNIRUC}>
          <span className={Style.textNameClient}>Dni/Ruc:</span>
          <input
            className={Style.inputNameDniRuc}
            value={valueDniRuc}
            type="number"
            onChange={(e) => setValueDniRuc(e.target.value)}
          />
        </div>
      </div>

      {/* PRODUCTOS */}
      <div className={Style.contenedorItems}>
        {productos.length === 0 ? (
          <p className={Style.NoProductsCarrito}>
            No hay productos en el carrito.
          </p>
        ) : (
          productos.map((producto, i) => (
            <div key={i} className={Style.estiloItemCarrito}>
              <div className={Style.estiloContentIMGNamePrice}>
                <Image
                  src={producto.imagen || "/images/placeholder.jpg"}
                  alt={producto.nombre}
                  width={40}
                  height={40}
                  className={Style.imagen}
                />

                <div className={Style.nombreProducto}>
                  <p className={Style.nombrePProducto}>{producto.nombre}</p>
                </div>

                {productoEditandoCantidad === i && puedeEditar ? (
                  <input
                    type="number"
                    min="1"
                    value={producto.cantidad}
                    onChange={(e) =>
                      handleCantidadChange(i, e.target.value)
                    }
                    onBlur={() => setProductoEditandoCantidad(null)}
                    autoFocus
                  />
                ) : (
                  <p
                    onDoubleClick={() =>
                      puedeEditar && setProductoEditandoCantidad(i)
                    }
                  >
                    Cantidad: {producto.cantidad}
                  </p>
                )}
              </div>

              <div className={Style.estiloContentColorTallaCantidad}>
                <div className={Style.estiloColor}>
                  <p>Talla: {producto.talla}</p>
                </div>

                <div className={Style.estiloTalla}>
                  <p>{producto.color}</p>
                </div>

                <div className={Style.precioProducto}>
                  <div className={Style.contentPrecioUnitario}>
                    {productoEditandoPrecio === i && puedeEditar ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={producto.precio}
                        onChange={(e) =>
                          handlePrecioChange(i, e.target.value)
                        }
                        onBlur={() => setProductoEditandoPrecio(null)}
                        autoFocus
                      />
                    ) : (
                      <p
                        className={Style.precioUnitario}
                        onDoubleClick={() =>
                          puedeEditar && setProductoEditandoPrecio(i)
                        }
                      >
                        S/. {producto.precio}
                      </p>
                    )}
                  </div>

                  <p>
                    SubTotal: S/.{" "}
                    {(Number(producto.precio) *
                      Number(producto.cantidad)).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className={Style.contentBotones}>
                <Image
                  src="/images/tachoBasura.png"
                  alt="Eliminar"
                  width={25}
                  height={15}
                  onClick={() => eliminarProducto(i)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <hr />

      <div className={Style.estiloContentSubTotal}>
        <h2 className={Style.subtotalLetra}>
          Total: S/. {subTotal.toFixed(2)}
        </h2>
      </div>

      {usuario && (
        <button
          className={Style.botonPreventa}
          disabled={procesando}
          onClick={handleRegistrarPreVenta}
        >
          {procesando ? "Guardando..." : "Pre Venta"}
        </button>
      )}
    </div>
  );
}