"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Style from "./mantSubCategorias.module.css";

export default function MantSubCategorias() {
  const router = useRouter();
  const { id } = useParams(); 

  const [subCategoria, setSubCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [idCategoria, setIdCategoria] = useState("");
  const [guardando, setGuardando] = useState(false);

  const irAFormSubCategorias = () => {
    router.push("/FormSubCategorias");
  };

  useEffect(() => {
    fetch("/api/categorias")
      .then(res => res.json())
      .then(data => {
        setCategorias(data);

        if (!id && data.length > 0) {
          setIdCategoria(String(data[0].id));
        }
      })
      .catch(err =>
        console.error("Error al cargar categorías:", err)
      );
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const cargarSubCategoria = async () => {
      try {
        const res = await fetch(`/api/subCategorias/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();

        setSubCategoria(data?.nombre ?? "");
        setIdCategoria(String(data?.categoriaId ?? ""));
      } catch (error) {
        console.error("Error al cargar subcategoría:", error);
      }
    };

    cargarSubCategoria();
  }, [id]);

  const submitSubCategorias = async (e) => {
    e.preventDefault();

    if (guardando) return;
    setGuardando(true);

    const url = id
      ? `/api/subCategorias/${id}`
      : "/api/subCategorias";

    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: subCategoria,
          id_categorias: Number(idCategoria),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al guardar la subcategoría");
        return;
      }

      alert(
        id
          ? "Subcategoría actualizada correctamente"
          : "Subcategoría creada correctamente"
      );

      router.push("/FormSubCategorias");

    } catch (error) {
      console.error("Error al guardar subcategoría:", error);
      alert("Error interno al guardar la subcategoría");
    }
  };

  return (
    <div className={Style.contentSubCategoria}>
      <h1 className={Style.titulo}>
        {id ? "Editar Subcategoría" : "Agregar Subcategoría"}
      </h1>

      <form className={Style.formulario} onSubmit={submitSubCategorias}>
        {/* Categoría */}
        <div className={Style.divCategorias}>
          <label>Categoría</label>
          <select
            value={idCategoria}
            required
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategoría */}
        <div className={Style.divSubCategorias}>
          <label>Nombre</label>
          <input
            className={Style.inputSubCategoria}
            type="text"
            value={subCategoria}
            required
            onChange={(e) => setSubCategoria(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className={Style.contentBotones}>
          <button
            type="submit"
            className={Style.btnGuardar}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : id
                ? "Actualizar Subcategoría"
                : "Guardar Subcategoría"}
          </button>

          <button
            type="button"
            className={Style.btnGuardar}
            onClick={irAFormSubCategorias}
          >
            Ver Subcategorías
          </button>
        </div>
      </form>
    </div>
  );
}