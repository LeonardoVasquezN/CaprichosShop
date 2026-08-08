"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./formTalla.module.css";
import { useTallaStore } from "../store/TallaStore";
import API_URL from "../config";

export default function FormTalla() {
  const [findTalla, setFindTalla] = useState("");

  const tallas = useTallaStore((state) => state.tallas);
  const setTallas = useTallaStore((state) => state.setTallas);
  const actualizarTalla = useTallaStore((state) => state.actualizarTalla);

  const router = useRouter();
  
  useEffect(() => {
    actualizarTalla();
  }, [actualizarTalla]);
  
  const tallasFiltradas = findTalla.trim()
    ? tallas.filter((t) =>
        t.nombre.toLowerCase().includes(findTalla.toLowerCase())
      )
    : tallas;

  const tallasOrdenadas = [...tallasFiltradas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      numeric: true,
      sensitivity: "base",
    })
  );
  
  const irAMantTalla = () => {
    router.push("/MantTalla");
  };

  const irMantTallaEdit = (id) => {
    router.push(`/MantTalla/${id}`);
  };
  
  const cambiarEstadoTalla = (id, nuevoEstado) => {
    fetch(`/api/tallas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ isActivo: nuevoEstado }),
    })
      .then((res) => res.json())
      .then(() => {
        setTallas((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, isActivo: nuevoEstado } : t
          )
        );
      })
      .catch((err) =>
        console.error("Error al cambiar estado de talla:", err)
      );
  };

  return (
    <div className={Style.contentTalla}>
      <h1 className={Style.titulo}>Tallas</h1>

      <div className={Style.contentAddFind}>
        <button className={Style.btnAddTalla} onClick={irAMantTalla}>
          Añadir tallas
        </button>

        <input
          placeholder="Buscar tallas..."
          className={Style.buscadorTallas}
          value={findTalla}
          onChange={(e) => setFindTalla(e.target.value)}
        />
      </div>

      <table className={Style.tablaTallas}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tallasOrdenadas.map((talla) => (
            <tr key={talla.id}>
              <td>{talla.nombre}</td>
              <td>
                <input
                  type="checkbox"
                  checked={talla.isActivo}
                  onChange={() =>
                    cambiarEstadoTalla(talla.id, !talla.isActivo)
                  }
                />
              </td>
              <td>
                <button
                  className={Style.btnEditar}
                  onClick={() => irMantTallaEdit(talla.id)}
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