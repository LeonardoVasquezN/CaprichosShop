"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./filtrado.module.css";

export default function Filtrado() {
  const { genero } = useParams();
  const router = useRouter();

  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then(setCategorias);

    fetch("/api/subCategorias")
      .then((r) => r.json())
      .then(setSubCategorias);
  }, []);

  const generoActual = genero === "Caballeros" ? "Caballeros" : "Damas";
  const categoriaId = generoActual === "Caballeros" ? 2 : 1;

  const subCategoriasFiltradas = subCategorias.filter(
    (s) => s.categoriaId === categoriaId
  );

  return (
    <div className={styles.contentFiltrado}>
      <div className={styles.contentTitulo}>Filtrar por</div>

      <div className={styles.contentGenero}>
        <span>GÉNERO</span>
      </div>

      <div className={styles.ContentGeneroData}>
        {categorias.map((cat) => (
          <label key={cat.id}>
            <input
              type="radio"
              name="genero"
              checked={generoActual === cat.nombre}
              onChange={() => router.push(`/catalogo/${cat.nombre}`)}
            />
            {cat.nombre}
          </label>
        ))}
      </div>

      <div className={styles.contentGenero}>
        <span>CATEGORÍA</span>
      </div>

      
      <div className={styles.ContentCategoriaData}>
        {subCategoriasFiltradas.map((sub) => (
          <>
            {sub.estado === 1 && <label key={sub.id}>
            <input
              type="radio"
              name="categoria"
              onChange={() =>
                router.push(`/catalogo/${generoActual}/${sub.id}`)
              }
            />
            {sub.nombre}
          </label>}
          </>
        ))}
      </div>
    </div>
  );
}