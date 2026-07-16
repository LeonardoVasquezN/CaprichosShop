"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./filtrado.module.css";

function obtenerLista(data, propiedades = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const propiedad of propiedades) {
    if (Array.isArray(data?.[propiedad])) {
      return data[propiedad];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function estaActivo(valor) {
  return (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    valor === undefined ||
    valor === null
  );
}

export default function Filtrado({
  marcas = [],
  colores = [],
  filtros,
  setFiltros,
  precioMaximo = 1000,
  cerrarFiltro,
}) {
  const params = useParams();
  const router = useRouter();

  const generoParametro = Array.isArray(params?.genero)
    ? params.genero[0]
    : params?.genero;

  const subcategoriaParametro = Array.isArray(
    params?.subcategoriaId
  )
    ? params.subcategoriaId[0]
    : params?.subcategoriaId;

  const generoActual =
    decodeURIComponent(generoParametro || "") === "Caballeros"
      ? "Caballeros"
      : "Damas";

  const categoriaId =
    generoActual === "Caballeros" ? 2 : 1;

  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        setCargando(true);

        const [
          respuestaCategorias,
          respuestaSubCategorias,
        ] = await Promise.all([
          fetch("/api/categorias", {
            cache: "no-store",
          }),

          fetch("/api/subCategorias", {
            cache: "no-store",
          }),
        ]);

        if (!respuestaCategorias.ok) {
          throw new Error(
            "No se pudieron obtener las categorías"
          );
        }

        if (!respuestaSubCategorias.ok) {
          throw new Error(
            "No se pudieron obtener las subcategorías"
          );
        }

        const dataCategorias =
          await respuestaCategorias.json();

        const dataSubCategorias =
          await respuestaSubCategorias.json();

        setCategorias(
          obtenerLista(dataCategorias, [
            "categorias",
            "categoria",
          ])
        );

        setSubCategorias(
          obtenerLista(dataSubCategorias, [
            "subCategorias",
            "subcategorias",
            "subCategoria",
          ])
        );
      } catch (error) {
        console.error(
          "Error al cargar categorías:",
          error
        );

        setCategorias([]);
        setSubCategorias([]);
      } finally {
        setCargando(false);
      }
    };

    cargarCategorias();
  }, []);

  const maximoSeguro = Math.max(
    1,
    Number(precioMaximo) || 1
  );

  const precioMinimoSeleccionado = Math.min(
    Number(filtros?.precioMin ?? 0),
    maximoSeguro
  );

  const precioMaximoSeleccionado = Math.max(
    precioMinimoSeleccionado,
    Math.min(
      Number(filtros?.precioMax ?? maximoSeguro),
      maximoSeguro
    )
  );

  /*
   * Para marcas y colores guardamos IDs.
   */
  const marcasSeleccionadas = Array.isArray(
    filtros?.marcas
  )
    ? filtros.marcas.map(String)
    : [];

  const coloresSeleccionados = Array.isArray(
    filtros?.colores
  )
    ? filtros.colores.map(String)
    : [];

  const subCategoriasFiltradas = Array.isArray(
    subCategorias
  )
    ? subCategorias.filter(
        (subCategoria) =>
          Number(subCategoria.categoriaId) ===
            categoriaId &&
          estaActivo(subCategoria.estado)
      )
    : [];

  const actualizarFiltros = (nuevosValores) => {
    setFiltros((filtrosAnteriores) => ({
      ...filtrosAnteriores,
      ...nuevosValores,
    }));
  };

  const cambiarGenero = (nombreGenero) => {
    router.push(
      `/catalogo/${encodeURIComponent(nombreGenero)}`
    );

    cerrarFiltro?.();
  };

  const cambiarSubcategoria = (subCategoria) => {
    const estaSeleccionada =
      Number(subcategoriaParametro) ===
      Number(subCategoria.id);

    if (estaSeleccionada) {
      router.push(`/catalogo/${generoActual}`);
    } else {
      router.push(
        `/catalogo/${generoActual}/${subCategoria.id}`
      );
    }

    cerrarFiltro?.();
  };

  const cambiarMarca = (marcaId) => {
    const id = String(marcaId);

    const seleccionada =
      marcasSeleccionadas.includes(id);

    actualizarFiltros({
      marcas: seleccionada
        ? marcasSeleccionadas.filter(
            (marcaSeleccionada) =>
              marcaSeleccionada !== id
          )
        : [...marcasSeleccionadas, id],
    });
  };

  const cambiarColor = (colorId) => {
    const id = String(colorId);

    const seleccionado =
      coloresSeleccionados.includes(id);

    actualizarFiltros({
      colores: seleccionado
        ? coloresSeleccionados.filter(
            (colorSeleccionado) =>
              colorSeleccionado !== id
          )
        : [...coloresSeleccionados, id],
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      marcas: [],
      colores: [],
      precioMin: 0,
      precioMax: maximoSeguro,
    });

    router.push(`/catalogo/${generoActual}`);
  };

  const porcentajeInicio =
    (precioMinimoSeleccionado / maximoSeguro) * 100;

  const porcentajeFin =
    (precioMaximoSeleccionado / maximoSeguro) * 100;

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  };

  return (
    <div className={styles.contentFiltrado}>
      <div className={styles.contentTitulo}>
        Filtrar por
      </div>

      {/* GÉNERO */}
      <section className={styles.seccionFiltro}>
        <div className={styles.tituloSeccion}>
          <span>GÉNERO</span>
          <span className={styles.flecha}>⌃</span>
        </div>

        <div className={styles.listaPildoras}>
          {categorias.map((categoria) => {
            const seleccionado =
              generoActual === categoria.nombre;

            return (
              <button
                key={categoria.id}
                type="button"
                className={`${styles.pildora} ${
                  seleccionado
                    ? styles.pildoraSeleccionada
                    : ""
                }`}
                onClick={() =>
                  cambiarGenero(categoria.nombre)
                }
              >
                {categoria.nombre}
              </button>
            );
          })}
        </div>
      </section>

      {/* CATEGORÍA */}
      <section className={styles.seccionFiltro}>
        <div className={styles.tituloSeccion}>
          <span>CATEGORÍA</span>
          <span className={styles.flecha}>⌃</span>
        </div>

        <div className={styles.listaPildoras}>
          {cargando && (
            <span className={styles.mensajeFiltro}>
              Cargando...
            </span>
          )}

          {!cargando &&
            subCategoriasFiltradas.map(
              (subCategoria) => {
                const seleccionado =
                  Number(subcategoriaParametro) ===
                  Number(subCategoria.id);

                return (
                  <button
                    key={subCategoria.id}
                    type="button"
                    className={`${styles.pildora} ${
                      seleccionado
                        ? styles.pildoraSeleccionada
                        : ""
                    }`}
                    onClick={() =>
                      cambiarSubcategoria(subCategoria)
                    }
                  >
                    {subCategoria.nombre}
                  </button>
                );
              }
            )}

          {!cargando &&
            subCategoriasFiltradas.length === 0 && (
              <span className={styles.mensajeFiltro}>
                No hay categorías
              </span>
            )}
        </div>
      </section>

      {/* PRECIO */}
      <section className={styles.seccionFiltro}>
        <div className={styles.tituloSeccion}>
          <span>Precio</span>
        </div>

        <div
          className={styles.rangoContenedor}
          style={{
            "--porcentaje-inicio": `${porcentajeInicio}%`,
            "--porcentaje-fin": `${porcentajeFin}%`,
          }}
        >
          <div className={styles.rangoLinea} />

          <input
            className={styles.rangoInput}
            type="range"
            min="0"
            max={maximoSeguro}
            value={precioMinimoSeleccionado}
            onChange={(event) => {
              const nuevoMinimo = Math.min(
                Number(event.target.value),
                precioMaximoSeleccionado
              );

              actualizarFiltros({
                precioMin: nuevoMinimo,
              });
            }}
            aria-label="Precio mínimo"
          />

          <input
            className={styles.rangoInput}
            type="range"
            min="0"
            max={maximoSeguro}
            value={precioMaximoSeleccionado}
            onChange={(event) => {
              const nuevoMaximo = Math.max(
                Number(event.target.value),
                precioMinimoSeleccionado
              );

              actualizarFiltros({
                precioMax: nuevoMaximo,
              });
            }}
            aria-label="Precio máximo"
          />
        </div>

        <div className={styles.preciosRango}>
          <span>
            S/.{" "}
            {formatearPrecio(
              precioMinimoSeleccionado
            )}
          </span>

          <span>
            S/.{" "}
            {formatearPrecio(
              precioMaximoSeleccionado
            )}
          </span>
        </div>
      </section>

      {/* MARCA */}
      <section className={styles.seccionFiltro}>
        <div className={styles.tituloSeccion}>
          <span>Marca</span>
        </div>

        <div className={styles.listaMarcas}>
          {marcas.length > 0 ? (
            marcas.map((marca) => {
              const marcaId = String(
                marca.id_marca ??
                  marca.idMarca ??
                  marca.id
              );

              return (
                <label
                  key={marcaId}
                  className={styles.marcaLabel}
                >
                  <input
                    type="checkbox"
                    checked={marcasSeleccionadas.includes(
                      marcaId
                    )}
                    onChange={() =>
                      cambiarMarca(marcaId)
                    }
                  />

                  <span>{marca.nombre}</span>
                </label>
              );
            })
          ) : (
            <span className={styles.mensajeFiltro}>
              
            </span>
          )}
        </div>
      </section>

      {/* COLOR */}
      <section className={styles.seccionFiltro}>
        <div className={styles.tituloSeccion}>
          <span>Color</span>
        </div>

        <div className={styles.listaColores}>
          {colores.length > 0 ? (
            colores.map((color) => {
              const colorId = String(color.id);

              const seleccionado =
                coloresSeleccionados.includes(colorId);

              return (
                <button
                  key={colorId}
                  type="button"
                  title={color.nombre}
                  aria-label={`Filtrar por color ${color.nombre}`}
                  aria-pressed={seleccionado}
                  className={`${styles.colorBoton} ${
                    seleccionado
                      ? styles.colorSeleccionado
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      color.hexadecimal ||
                      "#b5b5b5",
                  }}
                  onClick={() =>
                    cambiarColor(colorId)
                  }
                />
              );
            })
          ) : (
            <span className={styles.sinOpciones}>
              
            </span>
          )}
        </div>
      </section>

      <button
        type="button"
        className={styles.limpiarFiltros}
        onClick={limpiarFiltros}
      >
        Limpiar filtros
      </button>
    </div>
  );
}