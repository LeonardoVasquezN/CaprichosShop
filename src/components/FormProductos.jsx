"use client";

import { useEffect, useState } from "react";
import Style from "./formProductos.module.css";
import { useRouter } from "next/navigation";
import { useProductosStore } from "../store/ProductosStore";

export default function FormProductos() {
  const router = useRouter();

  const productos = useProductosStore((state) => state.productos);
  const setProductos = useProductosStore((state) => state.setProductos);
  const refrescarProductos = useProductosStore(
    (state) => state.refrescarProductos
  );

  const [findProduct, setFindProduct] = useState("");

  useEffect(() => {
    refrescarProductos();
  }, [refrescarProductos]);

  const productosFiltrados = findProduct.trim()
    ? productos.filter((p) =>{
      return(
        p.nombre.toLowerCase().includes(findProduct.toLowerCase()) ||
        p.marca?.nombre.toLowerCase().includes(findProduct.toLowerCase())
      );
    }
      )
    : productos;

  const productosOrdenados = [...productosFiltrados].sort((a, b) =>
    (a.marca?.nombre || "").localeCompare(
      b.marca?.nombre || "",
      "es",
      {
        sensitivity: "base",
      }
    )
  );

  const irAMantProducto = () => {
    router.push("/MantProductos");
  };

  const editarProducto = (id) => {
    router.push(`/MantProductos/${id}`);
  };

  const cambiarEstadoProducto = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;

    if (
      !confirm(
        nuevoEstado
          ? "¿Habilitar producto?"
          : "¿Deshabilitar producto?"
      )
    ) return;

    const res = await fetch(`/api/productos/${id}`, {
      method: "PATCH",
      headers:{
        "Content-Type":"application/json",
      },
      body: JSON.stringify({
        estado: nuevoEstado
      })
    });

    if (res.ok) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                estado: nuevoEstado
              }
            : p
        )
      );
    } else {
      alert("Error al cambiar estado");
    }
  };

  return (
    <div className={Style.contentProductos}>
      <h1 className={Style.productos}>Productos</h1>

      <div className={Style.contentAddFind}>
        <button
          className={Style.btnAñadirProductos}
          onClick={irAMantProducto}
        >
          Añadir Productos
        </button>

        <input
          placeholder="Buscar productos..."
          className={Style.buscadorProductos}
          value={findProduct}
          onChange={(e) => setFindProduct(e.target.value)}
        />
      </div>

      <table className={Style.tabla}>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Subcategoría</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Stock Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productosOrdenados.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productosOrdenados.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.marca?.nombre}</td>
                <td>{producto.nombre}</td>
                <td>{producto.subCategoria?.categoria?.nombre}</td>
                <td>{producto.subCategoria?.nombre}</td>
                <td>S/ {producto.precioCompra}</td>
                <td>S/ {producto.precioVenta}</td>
                <td>{producto.stockTotal}</td>
                <td> 
                  <button
                    className={Style.botonEditar}
                    onClick={() => editarProducto(producto.id)}
                  >
                    Editar
                  </button>
                  <button
                    className={
                      producto.estado
                        ? Style.botonEliminar
                        : Style.botonHabilitar
                    }
                    onClick={() =>
                      cambiarEstadoProducto(
                        producto.id,
                        producto.estado
                      )
                    }
                  >
                    {producto.estado ? "Deshabilitar" : "Habilitar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}