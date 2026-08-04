"use client";

import { useState } from "react";
import Image from "next/image";

import Style from "./login.module.css";
import { useLoginStore } from "@/store/LoginStore";
import { useUsuarioStore } from "@/store/UsuarioStore";

export default function Login() {
  const cerrarLogin = useLoginStore((state) => state.cerrarLogin);
  const iniciarSesion = useUsuarioStore((state) => state.iniciarSesion);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("Admin");
  const [clave, setClave] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado || !clave) {
      alert(" Debes seleccionar un usuario y escribir la clave");
      return;
    }

    try {
      const response = await fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    nombre: usuarioSeleccionado,
    clave: clave,
  }),
});

const data = await response.json();

if (!response.ok) {
  alert(data.message || "Credenciales incorrectas");
  return;
}

iniciarSesion(data.usuario);

alert("Inicio de sesión exitoso");
cerrarLogin();

      alert(" Inicio de sesión exitoso");
      cerrarLogin();

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert(" Error interno del servidor");
    }
  };

  return (
    <div className={Style.contentLogin}>
      <div className={Style.contentTituloYCerrar}>
        <h1 className={Style.titulo}>Iniciar Sesión</h1>

        <button
          className={Style.cerrarSesion}
          onClick={cerrarLogin}
          aria-label="Cerrar login"
        >
          ✕
        </button>
      </div>

      <Image
        src="/images/caprichosLogoT.png"
        alt="Logo"
        width={130}
        height={130}
        className={Style.logoIMG}
      />

      <div className={Style.apartadoLogeo}>
        <form className={Style.formularioLogin} onSubmit={handleLogin}>
          <select
            className={Style.selectUsuario}
            value={usuarioSeleccionado}
            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="Vendedora">Vendedora</option>
          </select>

          <input
            type="password"
            className={Style.inputClave}
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />

          <button className={Style.btnIniciarSesion} type="submit">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}