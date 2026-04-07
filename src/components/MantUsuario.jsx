"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Style from "./mantUsuario.module.css";
import API_URL from "../config";

export default function MantUsuario() {
  const router = useRouter();
  const { id } = useParams(); 

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [cargo, setCargo] = useState("");
  const [clave, setClave] = useState("");
  const [usuarioID, setUsuarioID] = useState(null);

  const irAFormUsuario = () => router.push("/FormUsuarios");

  const submitUsuarios = async (e) => {
    e.preventDefault();

    const url = id
      ? `/api/usuarios/${id}`
      : `/api/usuarios`;

    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: nombreUsuario,
          cargo,
          clave: clave,
        }),
      });

      if (!response.ok) throw new Error();

      alert(id ? " Usuario actualizado con éxito" : " Usuario registrado con éxito");
      router.push("/FormUsuarios");
    } catch (error) {
      alert(" Error al guardar usuario");
    }
  };

  useEffect(() => {
    if (!id) return;

    fetch(`/api/usuarios/${id}`)
      .then((res) => res.json())
      .then((data) => setUsuarioID(data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (usuarioID) {
      setNombreUsuario(usuarioID.nombre || "");
      setCargo(usuarioID.cargo || "");
    }
  }, [usuarioID]);

  return (
    <div className={Style.contentUsuario}>
      <h1 className={Style.titulo}>
        {id ? "Editar Usuario" : "Agregar Usuario"}
      </h1>

      <form className={Style.formulario} onSubmit={submitUsuarios}>
        <div className={Style.divUsuarios}>
          <label>Nombre</label>
          <input
            className={Style.inputNombre}
            value={nombreUsuario}
            required
            onChange={(e) => setNombreUsuario(e.target.value)}
          />
        </div>

        <div className={Style.divComboUsuarios}>
          <label>Cargo</label>
          <select
            className={Style.comboUsuarios}
            value={cargo}
            required
            onChange={(e) => setCargo(e.target.value)}
          >
            <option value="">Elegir usuario</option>
            <option value="Administrador">Administrador</option>
            <option value="Vendedor">Vendedor</option>
          </select>
        </div>

        <div className={Style.divClaves}>
          <label>Clave</label>
          <input
            className={Style.inputTallas}
            type="password"
            value={clave}
            required
            onChange={(e) => setClave(e.target.value)}
          />
        </div>

        <div className={Style.contentBotones}>
          <button type="submit" className={Style.btnGuardar}>
            Guardar Usuario
          </button>
          <button
            type="button"
            className={Style.btnGuardar}
            onClick={irAFormUsuario}
          >
            Ver Usuarios
          </button>
        </div>
      </form>
    </div>
  );
}