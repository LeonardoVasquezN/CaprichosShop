"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Style from "./mantMarcas.module.css";

export default function MantMarcas() {
  const router = useRouter();
  const { id } = useParams();

  const [nombreMarca, setNombreMarca] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;

    const cargarMarca = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/marcas/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("No se pudo cargar la marca");

        const data = await res.json();
        setNombreMarca(data.nombre);

      } catch (error) {
        console.error("Error al cargar marca:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMarca();
  }, [id]);

  const submitMarcas = async (e) => {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);

    const url = id ? `/api/marcas/${id}` : `/api/marcas`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreMarca }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al guardar la marca");
        return;
      }

      alert(id ? "Marca actualizada" : "Marca creada");
      router.push("/FormMarcas");
    } catch(error) {
      console.error(" Error al guardar la marca", error);
      alert("Error interno al guardar la marca");
    }
  };

  if (loading) return <p>Cargando marca...</p>;

  return (
    <div className={Style.mantMarcas}>
      <h1 className={Style.titulo}>
        {id ? "Editar Marca" : "Agregar Marca"}
      </h1>

      <form className={Style.formulario} onSubmit={submitMarcas}>
        <div className={Style.divMarcas}>
          <label>Nombre:</label>
          <input
            className={Style.inputMarca}
            value={nombreMarca}
            onChange={(e) => setNombreMarca(e.target.value)}
            required
          />
        </div>

        <div className={Style.contentBotones}>
          <button
            type="submit"
            className={Style.btnGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar Marca"}
          </button>

          <button
            type="button"
            className={Style.btnGuardar}
            onClick={() => router.push("/FormMarcas")}
          >
            Ver Marcas
          </button>
        </div>
      </form>
    </div>
  );
}