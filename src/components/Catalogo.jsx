"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Card from "./Card";
import Filtrado from "./Filtrado";
import Styles from "./catalogo.module.css";

import { useBusquedaStore } from "../store/BusquedaStore";
import { useProductosStore } from "../store/ProductosStore";

export default function Catalogo() {
  const { genero, subcategoriaId } = useParams();
  const router = useRouter();

  const [openFiltro, setOpenFiltro] = useState(false);

  const generoActual = genero === "Caballeros" ? "Caballeros" : "Damas";
  const categoriaId = generoActual === "Caballeros" ? 2 : 1;

  const productos = useProductosStore((s) => s.productos);
  const setProductos = useProductosStore((s) => s.setProductos);

  const textoBusqueda = useBusquedaStore((s) => s.textoBusqueda);
  const textoBusquedaTemporal = useBusquedaStore(
    (s) => s.textoBusquedaTemporal
  );
  const buscadorActivo = useBusquedaStore(
    (s) => s.buscadorActivo
  );

  useEffect(() => {
    fetch("/api/productos", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [setProductos]);

  const productosFiltrados = useMemo(() => {
    let lista = Array.isArray(productos) ? productos : [];

    lista = lista.filter(
      (p) => p.marca && p.marca.estado === 1
    );

    if (textoBusqueda) {
      const t = textoBusqueda.toLowerCase();
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(t)
      );
    }

    lista = lista.filter(
      (p) => p.subCategoria?.categoria?.id === categoriaId
    );

    if (subcategoriaId) {
      lista = lista.filter(
        (p) => p.subCategoriaId === Number(subcategoriaId)
      );
    }

    return lista;
  }, [productos, textoBusqueda, categoriaId, subcategoriaId]);

  return (
    <div className={Styles.divCatalogo}>
     
      {!textoBusquedaTemporal &&
        !textoBusqueda &&
        !buscadorActivo && (
          <div className={Styles.filtroMobileWrapper}>
            <button
              className={Styles.btnFiltroMobile}
              onClick={() => setOpenFiltro(true)}
            >
              🔍 Filtrar por
            </button>
          </div>
        )}

      <div className={Styles.containerFiltradoDesktop}>
        <Filtrado />
      </div>

      {openFiltro && (
        <div className={Styles.modalFiltro}>
          <div className={Styles.modalContent}>
            <button
              className={Styles.closeModal}
              onClick={() => setOpenFiltro(false)}
            >
              ✕
            </button>
            <Filtrado />
          </div>
        </div>
      )}

      {/* PRODUCTOS */}
      <div className={Styles.containerCatalogo}>
        {productosFiltrados.map((p) => (
          <>
            {p.estado === true && p.subCategoria?.estado === 1 && <Card
              key={p.id}
              onClick={() => router.push(`/detalle/${p.id}`)}
              imagenCatalogo={p.imagen}
              marca={p.marca?.nombre}
              nombre={p.nombre}
              precio={`S/. ${p.precioVenta}`}
            />}
          </>
        ))}
      </div>
    </div>
  );
}