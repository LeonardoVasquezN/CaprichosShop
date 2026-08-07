"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./formExistencias.module.css";
import { useExistenciaStore } from "../store/ExistenciaStore";

export default function FormExistencias() {
  const router = useRouter();

  const existencias = useExistenciaStore((state) => state.existencias);
  const setExistencias = useExistenciaStore((state) => state.setExistencias);

  const [findExistencia, setFindExistencia] = useState("");

  const irMantExistencia = () => {
    router.push("/MantExistencia");
  };

  const irMantExistenciaEdit = (id) => {
    router.push(`/MantExistencia/${id}`);
  };

  useEffect(() => {
    fetch("/api/variantes")
      .then((response) => response.json())
      .then((data) => setExistencias(data))
      .catch((error) =>
        console.error("Error al obtener existencias:", error)
      );
  }, [setExistencias]);
  
  const existenciasFiltradas = findExistencia.trim()
    ? existencias.filter((existencia) =>{
      return(
        existencia.producto.nombre.toLowerCase().includes(findExistencia.toLowerCase()) ||
        existencia.producto.marca?.nombre.toLowerCase().includes(findExistencia.toLowerCase())
      );
    }
      )
    : existencias;

  const eliminarProducto = (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta variante?")) return;

    fetch(`/api/variantes/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setExistencias((prev) => prev.filter((e) => e.id !== id));
      })
      .catch((error) =>
        console.error("Error al eliminar la existencia:", error)
      );
  };

  return (
    <div className={Style.contentExistencias}>
      <div className={Style.contentAddFind}>
        <button
          className={Style.btnAñadirExistencias}
          onClick={irMantExistencia}
        >
          Añadir Existencias
        </button>

        <input
          placeholder="Buscar productos..."
          className={Style.buscadorProductos}
          onChange={(e) => setFindExistencia(e.target.value)}
        />
      </div>

      <table className={Style.tabla}>
        <thead>
          <tr>
            <th>marca</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Subcategoría</th>
            <th>Color</th>
            <th>Talla</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {existenciasFiltradas.map((existencia) => (
            <tr key={existencia.id}>
              <td>{existencia.producto.marca?.nombre}</td>
              <td>{existencia.producto.nombre}</td>

              <td>
                {existencia.producto.subCategoria?.categoria?.nombre || "-"}
              </td>

              <td>
                {existencia.producto.subCategoria?.nombre || "-"}
              </td>
            
              <td>{existencia.color.nombre}</td>
              <td>{existencia.talla.nombre}</td>
              <td>{existencia.stock}</td>

              <td>
                <button
                  className={Style.botonEditar}
                  onClick={() => irMantExistenciaEdit(existencia.id)}
                >
                  Editar
                </button>

                <button
                  className={Style.botonEliminar}
                  onClick={() => eliminarProducto(existencia.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}