"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./mantCategorias.module.css";

export default function MantCategorias({ id }) {
  const router = useRouter();
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [guardando, setGuardando] = useState(false);
 
  useEffect(() => {
    if (!id) return;

    const cargarCategoria = async () => {
      try {
        const res = await fetch(`/api/categorias/${id}`);

        if (!res.ok) {
          console.error("Error al cargar categoría");
          return;
        }

        const data = await res.json();

        setNombreCategoria(data.nombre ?? "");
      } catch (error) {
        console.error("Error al cargar categoría:", error);
      }
    };

    cargarCategoria();
  }, [id]);

  // GUARDAR

  const submitCategories = async (e) => {
    e.preventDefault();

    if (guardando) return;
    setGuardando(true);

    const url = id ? `/api/categorias/${id}` : `/api/categorias`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreCategoria }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensaje || "Error al guardar la categoría");
      return;
    }

    alert(id ? "Categoría actualizada" : "Categoría creada");
    router.push("/FormCategorias");
    } catch {
      alert(" Error al guardar la categoría");
    }
  };

  return (
    <div className={Style.mantCategorias}>
      <h1 className={Style.titulo}>
        {id ? "Editar Categoría" : "Agregar Categoría"}
      </h1>

      <form className={Style.formulario} onSubmit={submitCategories}>
        <div className={Style.divCategorias}>
          <label>Nombre:</label>
          <input
            className={Style.inputCategoria}
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            required
          />
        </div>

        <div className={Style.contentBotones}>
          <button
            type="submit"
            className={Style.btnGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Categoría"}
          </button>

          <button
            type="button"
            className={Style.btnGuardar}
            onClick={() => router.push("/FormCategorias")}
          >
            Ver Categorías
          </button>
        </div>
      </form>
    </div>
  );
}