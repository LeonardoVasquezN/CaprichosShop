"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Style from "./header.module.css";
import AutoCompletado from "./AutoCompletado";

import { useBusquedaStore } from "@/store/BusquedaStore";
import { useContextoStore } from "@/store/ContextoStore";
import { useLoginStore } from "@/store/LoginStore";
import { useMenuStore } from "@/store/MenuStore";
import { useCarritoStore } from "@/store/CarritoStore";
import { useUsuarioStore } from "@/store/UsuarioStore";
import { useProductosStore } from "@/store/ProductosStore";

import { verificarSesionFront } from "@/lib/verificarSesion";

export default function Header() {

  const router = useRouter();

  const usuario = useUsuarioStore((s) => s.usuario);
  const cerrarSesion = useUsuarioStore((s) => s.cerrarSesion);
  const cargarUsuario = useUsuarioStore((s) => s.cargarUsuario);
  
  const setTextoBusqueda = useBusquedaStore((s) => s.setTextoBusqueda);
  const textoBusquedaTemporal = useBusquedaStore(
    (s) => s.textoBusquedaTemporal
  );
  const setTextoBusquedaTemporalStore = useBusquedaStore(
    (s) => s.setTextoBusquedaTemporal
  );
  const setBuscadorActivo = useBusquedaStore(
    (s) => s.setBuscadorActivo
  );

  const setProductosFiltrados = useContextoStore(
    (s) => s.setProductosFiltrados
  );

  const abrirLogin = useLoginStore((s) => s.abrirLogin);
  const toggleMenu = useMenuStore((s) => s.toggleMenu);
  const abrirCarrito = useCarritoStore((s) => s.abrirCarrito);

  const productosCarrito = useCarritoStore((s) => s.productos);

  const totalProductos = productosCarrito.reduce(
    (total, producto) => total + (producto.cantidad || 1),
    0
  );
  
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const productos = useProductosStore((s) => s.productos);

  const setBusquedaActiva = useBusquedaStore((s) => s.setBusquedaActiva);
  
  useEffect(() => {
    cargarUsuario();
    
    const verificar = async() => {
      await verificarSesionFront();
    }

    verificar();

  }, [cargarUsuario]);
  
  const handleInputChange = (e) => {
    const valor = e.target.value;

    setTextoBusquedaTemporalStore(valor);
    setShowAutoComplete(true);

    if (valor.trim() === "") {
      setBusquedaActiva(false);
      setTextoBusqueda("");
      setProductosFiltrados([]);
      return;
    }

    setBusquedaActiva(true);
    
    const texto = valor.toLowerCase();

    const filtrados = productos.filter((p) =>
      p.nombre.toLowerCase().includes(texto) ||
      p.marca?.nombre.toLowerCase().includes(texto)
    );

    setProductosFiltrados(filtrados);
  };

  return (
    <header className={Style.contenedorHeader}>
      <div className={Style.containerLogoHamburguesa}>
        <Image
          src="/images/caprichosLogoT.png"
          className={Style.logoIMG}
          alt="Caprichos Shop"
          width={90}
          height={90}
          priority
          onClick={() => router.push("/")}
        />

        {usuario && (
          <>
            <Image
              src="/images/Hamburguesa.png"
              className={Style.iconHamburguesa}
              alt="Menu"
              width={40}
              height={40}
              onClick={toggleMenu}
            />
            <span className={Style.menuLetra}>Menu</span>
          </>
        )}
      </div>

      {/* BUSCADOR */}
      <div className={Style.buscadorPrendas}>
        <input
          className={Style.inputBuscador}
          type="text"
          placeholder="¿Qué estás buscando?"
          value={textoBusquedaTemporal}
          onFocus={() => setBuscadorActivo(true)}
          onBlur={() => setBuscadorActivo(false)}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTextoBusqueda(textoBusquedaTemporal);
              setShowAutoComplete(false);
              setBuscadorActivo(false);
              router.push("/catalogo/caballero");
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setShowAutoComplete(false);
              setBuscadorActivo(false);
              e.currentTarget.blur();
            }
          }}
        />

        <div className={Style.containerBuscador}>
          <Image
            src="/images/lupa.png"
            className={Style.imgLupa}
            alt="Buscar"
            width={25}
            height={25}
          />
        </div>
      </div>

      {/* AUTOCOMPLETADO */}
      {showAutoComplete && (
        <AutoCompletado
          setShowAutoComplete={setShowAutoComplete}
          setTextoBusquedaTemporal={setTextoBusquedaTemporalStore}
          setProductosFiltrados={setProductosFiltrados}
        />
      )}

      <div className={Style.contenedorHeaderOpciones}>

      <div
        className={Style.contenedorCarrito}
        onClick={abrirCarrito}
      >
        <Image
          src="/images/lastCarritoCompras.png"
          className={Style.iconCarrito}
          alt="Carrito"
          width={40}
          height={40}
        />

        {totalProductos > 0 && (
          <span className={Style.badgeCarrito}>
            {totalProductos}
          </span>
        )}
      </div>

        {usuario ? (
          <div className={Style.usuarioInfo}>
            <Image
              src="/images/userIconHeaderP.png"
              className={Style.iconUsuario}
              alt="Usuario"
              width={40}
              height={40}
              onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
            />
            <span className={Style.nombreUsuario}>{usuario.nombre}</span>

            {mostrarMenuUsuario && (
              <div className={Style.menuUsuario}>
                <button
                  className={Style.botonCerrarSesion}
                  onClick={() => {
                    cerrarSesion();
                    setMostrarMenuUsuario(false);
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className={Style.btnIniciarSesion}
            onClick={abrirLogin}
          >
            Inicia Sesión
          </button>
        )}
      </div>
    </header>
  );
}