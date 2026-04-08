"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./formSubCategorias.module.css";
import { useSubCategoriasStore } from "../store/SubCategoriasStore";

export default function FormSubCategorias() {
  const [findSubCategoria, setFindSubCategoria] = useState("");

  const subCategorias = useSubCategoriasStore((s) => s.subCategorias);
  const actualizarSubCategorias = useSubCategoriasStore(
    (s) => s.actualizarSubCategorias
  );

  const router = useRouter();

  useEffect(() => {
    actualizarSubCategorias();
  }, [actualizarSubCategorias]);

  const subCategoriasFiltradas = Array.isArray(subCategorias)
    ? findSubCategoria.trim()
      ? subCategorias.filter((sc) =>
          sc.nombre
            .toLowerCase()
            .includes(findSubCategoria.toLowerCase())
        )
      : subCategorias
    : [];

  const cambiarEstadoSubCategorias = async (id, nuevoEstado) => {
    try {
      useSubCategoriasStore.setState((state) => ({
        subCategorias: state.subCategorias.map((sc) =>
          sc.id === id ? { ...sc, estado: nuevoEstado } : sc
        ),
      }));

      await fetch(`/api/subCategorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      await actualizarSubCategorias();

    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  return (
    <div className={Style.formSubCategorias}>
      <h1 className={Style.titulo}>Subcategorías</h1>

      <div className={Style.contentAddFind}>
        <button
          className={Style.btnAddSubCategorias}
          onClick={() => router.push("/MantSubCategorias")}
        >
          Agregar Subcategorías
        </button>

        <input
          placeholder="Buscar subcategorías..."
          className={Style.buscadorSubCategoria}
          value={findSubCategoria}
          onChange={(e) => setFindSubCategoria(e.target.value)}
        />
      </div>

      <table className={Style.tablaSubCategorias}>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {subCategoriasFiltradas.map((sc) => (
            <tr key={sc.id}>
              <td>{sc.categoria?.nombre}</td>
              <td>{sc.nombre}</td>
              <td>
                <input
                  type="checkbox"
                  checked={sc.estado === 1}
                  onChange={() =>
                    cambiarEstadoSubCategorias(
                      sc.id,
                      sc.estado === 1 ? 0 : 1
                    )
                  }
                />
              </td>
              <td>
                <button
                  className={Style.btnEditar}
                  onClick={() =>
                    router.push(`/MantSubCategorias/${sc.id}`)
                  }
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}

          {subCategoriasFiltradas.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay subcategorías
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}