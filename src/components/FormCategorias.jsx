"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./formCategorias.module.css";
import API_URL from "../config";

export default function FormCategorias() {
  const [categorias, setCategorias] = useState([]);
  const router = useRouter();

  const irAMantCategorias = () => {
    router.push("/MantCategorias");
  };

  const irCategoriasEdit = (id) => {
    router.push(`/MantCategorias/${id}`);
  };
  
  useEffect(() => {
    fetch(`/api/categorias`)
      .then((res) => res.json())
      .then((data) =>
        setCategorias(
          [...data].sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es", {
              sensitivity: "base",
            })
          )
        )
      )
      .catch((error) =>
        console.error("Error al obtener categorías:", error)
      );
  }, []);

  return (
    <div className={Style.formCategorias}>
      <h1 className={Style.titulo}>Categorías</h1>

      <button
        className={Style.btnAddCategorias}
        onClick={irAMantCategorias}
      >
        Agregar categorías
      </button>

      <table className={Style.tablaCategorias}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>{categoria.nombre}</td>
              <td>
                <button
                  className={Style.btnEditar}
                  onClick={() => irCategoriasEdit(categoria.id)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}