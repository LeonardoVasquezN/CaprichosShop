"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Style from "./login.module.css";
import { useLoginStore } from "@/store/LoginStore";
import { useUsuarioStore } from "@/store/UsuarioStore";

export default function Login() {
  const cerrarLogin = useLoginStore((state) => state.cerrarLogin);
  const iniciarSesion = useUsuarioStore((state) => state.iniciarSesion);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("Admin");
  const [clave, setClave] = useState("");

  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);
  const [minutosRestantes, setMinutosRestantes] = useState(0);

  useEffect(() => {
    const bloqueoGuardado = localStorage.getItem("loginBloqueadoHasta");

    if (!bloqueoGuardado) return;

    const fechaBloqueo = Number(bloqueoGuardado);

    if (fechaBloqueo > Date.now()) {
      setBloqueadoHasta(fechaBloqueo);
    } else {
      localStorage.removeItem("loginBloqueadoHasta");
    }
  }, []);

  useEffect(() => {
    if (!bloqueadoHasta) {
      setMinutosRestantes(0);
      return;
    }

    const actualizarContador = () => {
      const diferencia = bloqueadoHasta - Date.now();

      if (diferencia <= 0) {
        setBloqueadoHasta(null);
        setMinutosRestantes(0);

        localStorage.removeItem("loginBloqueadoHasta");

        return;
      }

      const minutos = Math.ceil(diferencia / 60000);

      setMinutosRestantes(minutos);
    };

    actualizarContador();

    const intervalo = setInterval(actualizarContador, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueadoHasta]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (bloqueadoHasta && bloqueadoHasta > Date.now()) {
      return;
    }

    if (!usuarioSeleccionado || !clave) {
      alert("Debes seleccionar un usuario y escribir la clave");
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

      if (response.status === 429 && data.bloqueadoHasta) {
        const fechaBloqueo = Number(data.bloqueadoHasta);

        setBloqueadoHasta(fechaBloqueo);

        localStorage.setItem(
          "loginBloqueadoHasta",
          String(fechaBloqueo)
        );

        setClave("");

        return;
      }

      if (!response.ok) {
        alert(data.message || "Credenciales incorrectas");
        return;
      }

      localStorage.removeItem("loginBloqueadoHasta");
      setBloqueadoHasta(null);

      iniciarSesion(data.usuario);

      alert("Inicio de sesión exitoso");
      cerrarLogin();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error interno del servidor");
    }
  };

  const estaBloqueado =
    bloqueadoHasta !== null && bloqueadoHasta > Date.now();

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
            disabled={estaBloqueado}
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
            disabled={estaBloqueado}
          />

          <button
            className={Style.btnIniciarSesion}
            type="submit"
            disabled={estaBloqueado}
          >
            {estaBloqueado ? "Bloqueado" : "Iniciar Sesión"}
          </button>

          {estaBloqueado && (
            <p className={Style.mensajeBloqueo}>
              Vuelve a intentar dentro de{" "}
              <strong>{minutosRestantes} minutos</strong>.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}