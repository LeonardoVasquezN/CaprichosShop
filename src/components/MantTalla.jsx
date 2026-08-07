"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Style from "./mantTalla.module.css";

export default function MantTalla() {
  const router = useRouter();
  const { id } = useParams(); 

  const [guardarTalla, setGuardarTalla] = useState("");

  useEffect(() => {
    if (!id) return;

    const cargarTalla = async () => {
      try {
        const res = await fetch(`/api/tallas/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setGuardarTalla(data?.nombre ?? "");
      } catch (error) {
        console.error("Error al obtener la talla:", error);
        setGuardarTalla("");
      }
    };

    cargarTalla();
  }, [id]);

  const submitNombresTalla = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        id ? `/api/tallas/${id}` : "/api/tallas",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: guardarTalla }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensaje || "Error al guardar la talla");

      alert(
        id
          ? " Talla actualizada con éxito"
          : " Talla registrada con éxito"
      );

      router.push("/FormTalla");
    } catch(error) {
      alert(error.message);
    }
  };

  return (
    <div className={Style.contentTalla}>
      <h1 className={Style.titulo}>
        {id ? "Editar Talla" : "Agregar Talla"}
      </h1>

      <form className={Style.formulario} onSubmit={submitNombresTalla}>
        <div className={Style.divTallas}>
          <label>Talla:</label>
          <input
            className={Style.inputTallas}
            type="text"
            value={guardarTalla}
            onChange={(e) => setGuardarTalla(e.target.value)}
            required
          />
        </div>

        <div className={Style.contentBotones}>
          <button type="submit" className={Style.btnGuardar}>
            Guardar Talla
          </button>
          <button
            type="button"
            className={Style.btnGuardar}
            onClick={() => router.push("/FormTalla")}
          >
            Ver Tallas
          </button>
        </div>
      </form>
    </div>
  );
}