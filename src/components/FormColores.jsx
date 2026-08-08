"use client";

import { useEffect, useState } from "react";
import Style from "./formColores.module.css";
import { useRouter } from "next/navigation";
import { useColorStore } from "../store/ColorStore";

export default function FormColores() {
  const colores = useColorStore((state) => state.colores);
  const setColores = useColorStore((state) => state.setColores);
  const actualizarColores = useColorStore((state) => state.actualizarColores);

  const [findColor, setFindColor] = useState("");
  const router = useRouter();

  useEffect(() => {
    actualizarColores();
  }, [actualizarColores]);

  const cambiarEstadoColores = async (id, nuevoEstado) => {
    await fetch(`/api/colores/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    setColores((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, estado: nuevoEstado } : c
      )
    );
  };

  const coloresFiltrados = findColor.trim()
    ? colores.filter((c) =>
        c.nombre.toLowerCase().includes(findColor.toLowerCase())
      )
    : colores;

  const coloresOrdenados = [...coloresFiltrados].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
    })
  );

  return (
    <div className={Style.contentColores}>
      <h1 className={Style.titulo}>Colores</h1>

      <div className={Style.contentAddFind}>
        <button
          className={Style.btnAddColores}
          onClick={() => router.push("/MantColor")}
        >
          Agregar Colores
        </button>

        <input
          className={Style.buscadorColores}
          placeholder="Buscar colores..."
          onChange={(e) => setFindColor(e.target.value)}
        />
      </div>

      <table className={Style.tablaColores}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Hexadecimal</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coloresOrdenados.map((color) => (
            <tr key={color.id}>
              <td>{color.nombre}</td>
              <td>{color.hexadecimal}</td>
              <td>
                <input
                  type="checkbox"
                  checked={color.estado === 1}
                  onChange={() =>
                    cambiarEstadoColores(
                      color.id,
                      color.estado === 1 ? 0 : 1
                    )
                  }
                />
              </td>
              <td>
                <button
                  className={Style.btnEditar}
                  onClick={() =>
                    router.push(`/MantColor/${color.id}`)
                  }
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