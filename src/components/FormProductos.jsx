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
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(findProduct.toLowerCase())
      )
    : productos;

  const irAMantProducto = () => {
    router.push("/MantProductos");
  };

  const editarProducto = (id) => {
    router.push(`/MantProductos/${id}`);
  };

  const eliminarProducto = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    const res = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProductos((prev) => prev.filter((p) => p.id != id));
    } else {
      alert(" Error al eliminar");
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
          {productosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No hay productos registrados
              </td>
            </tr>
          ) : (
            productosFiltrados.map((producto) => (
              <tr key={producto.id}>
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
                    className={Style.botonEliminar}
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    Deshabilitar
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