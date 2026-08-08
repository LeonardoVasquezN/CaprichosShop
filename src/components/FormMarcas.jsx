"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./formMarcas.module.css";
import { useMarcaStore } from "../store/MarcaStore";

export default function FormMarcas() {
  const router = useRouter();

  const marcas = useMarcaStore((state) => state.marcas);
  const actualizarMarcas = useMarcaStore((state) => state.actualizarMarcas);
  const cambiarEstadoMarca = useMarcaStore(
    (state) => state.cambiarEstadoMarca
  );

  const [findMarca, setFindMarca] = useState("");

  useEffect(() => {
    actualizarMarcas();
  }, [actualizarMarcas]);

  const marcasFiltradas = Array.isArray(marcas)
    ? findMarca.trim()
      ? marcas.filter((m) =>
          m.nombre.toLowerCase().includes(findMarca.toLowerCase())
        )
      : marcas
    : [];

  const marcasOrdenadas = [...marcasFiltradas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base", }) );

  return (
    <div className={Style.formMarcas}>
      <h1 className={Style.titulo}>Marcas</h1>

      <div className={Style.contentAddFind}>
        <button
          className={Style.btnAddMarcas}
          onClick={() => router.push("/MantMarcas")}
        >
          Agregar Marca
        </button>

        <input
          className={Style.buscadorMarcas}
          placeholder="Buscar marcas..."
          value={findMarca}
          onChange={(e) => setFindMarca(e.target.value)}
        />
      </div>

      <table className={Style.tablaMarcas}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {marcasOrdenadas.length > 0 ? (
            marcasOrdenadas.map((marca) => (
              <tr key={marca.idMarca}>
                <td>{marca.nombre}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={marca.estado === 1}
                    onChange={() =>
                      cambiarEstadoMarca(marca.idMarca, marca.estado)
                    }
                  />
                </td>
                <td>
                  <button
                    className={Style.btnEditar}
                    onClick={() =>
                      router.push(`/MantMarcas/${marca.idMarca}`)
                    }
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No hay marcas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}