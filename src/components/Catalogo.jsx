"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Card from "./Card";
import Filtrado from "./Filtrado";
import Styles from "./catalogo.module.css";

import { supabase } from "../lib/supabaseClient";

import { useBusquedaStore } from "../store/BusquedaStore";
import { useProductosStore } from "../store/ProductosStore";

const PRODUCTOS_POR_PAGINA = 10;

function estaActivo(valor) {
  return (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    valor === undefined ||
    valor === null
  );
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function convertirNumero(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  if (typeof valor === "string") {
    let texto = valor.replace(/[^\d.,-]/g, "");

    if (
      texto.includes(",") &&
      texto.includes(".")
    ) {
      texto = texto.replace(/,/g, "");
    } else if (texto.includes(",")) {
      texto = texto.replace(",", ".");
    }

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : 0;
  }

  return 0;
}

function obtenerListaProductos(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.productos)) {
    return data.productos;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function obtenerPaginasVisibles(
  paginaActual,
  totalPaginas
) {
  if (totalPaginas <= 7) {
    return Array.from(
      { length: totalPaginas },
      (_, indice) => indice + 1
    );
  }

  const paginas = [1];

  if (paginaActual > 4) {
    paginas.push("inicio");
  }

  const inicio = Math.max(
    2,
    paginaActual - 1
  );

  const fin = Math.min(
    totalPaginas - 1,
    paginaActual + 1
  );

  for (
    let numeroPagina = inicio;
    numeroPagina <= fin;
    numeroPagina += 1
  ) {
    paginas.push(numeroPagina);
  }

  if (
    paginaActual <
    totalPaginas - 3
  ) {
    paginas.push("fin");
  }

  paginas.push(totalPaginas);

  return paginas;
}

export default function Catalogo() {
  const params = useParams();
  const router = useRouter();

  const generoParametro = Array.isArray(
    params?.genero
  )
    ? params.genero[0]
    : params?.genero;

  const subcategoriaParametro = Array.isArray(
    params?.subcategoriaId
  )
    ? params.subcategoriaId[0]
    : params?.subcategoriaId;

  const generoActual =
    decodeURIComponent(generoParametro || "") ===
    "Caballeros"
      ? "Caballeros"
      : "Damas";

  const categoriaId =
    generoActual === "Caballeros" ? 2 : 1;

  const [openFiltro, setOpenFiltro] =
    useState(false);

  const [cargando, setCargando] =
    useState(true);

  const [pagina, setPagina] =
    useState(1);

  const [marcas, setMarcas] =
    useState([]);

  const [colores, setColores] =
    useState([]);

  const [variantes, setVariantes] =
    useState([]);

  const [errorCarga, setErrorCarga] =
    useState("");

  const [filtros, setFiltros] =
    useState({
      marcas: [],
      colores: [],
      precioMin: 0,
      precioMax: null,
    });

  const productos = useProductosStore(
    (estado) => estado.productos
  );

  const setProductos = useProductosStore(
    (estado) => estado.setProductos
  );

  const textoBusqueda = useBusquedaStore(
    (estado) => estado.textoBusqueda
  );

  /*
   * Carga de productos desde tu API.
   *
   * Marcas, colores y variantes se consultan
   * directamente desde Supabase.
   */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setErrorCarga("");

        const [
          respuestaProductos,
          respuestaMarcas,
          respuestaColores,
          respuestaVariantes,
        ] = await Promise.all([
          fetch("/api/productos", {
            cache: "no-store",
          }),

          supabase
            .from("marcas")
            .select(
              "id_marca, nombre, estado"
            )
            .eq("estado", 1)
            .order("id_marca", {
              ascending: true,
            }),

          supabase
            .from("color")
            .select(
              "id, nombre, hexadecimal, estado"
            )
            .eq("estado", 1)
            .order("id", {
              ascending: true,
            }),

          supabase
            .from("variante")
            .select(
              "id, id_producto, id_color, id_talla, stock"
            ),
        ]);

        if (!respuestaProductos.ok) {
          throw new Error(
            "No se pudieron obtener los productos"
          );
        }

        if (respuestaMarcas.error) {
          throw new Error(
            `Error al obtener marcas: ${respuestaMarcas.error.message}`
          );
        }

        if (respuestaColores.error) {
          throw new Error(
            `Error al obtener colores: ${respuestaColores.error.message}`
          );
        }

        if (respuestaVariantes.error) {
          throw new Error(
            `Error al obtener variantes: ${respuestaVariantes.error.message}`
          );
        }

        const dataProductos =
          await respuestaProductos.json();

        const listaProductos =
          obtenerListaProductos(dataProductos);

        setProductos(listaProductos);

        setMarcas(
          Array.isArray(respuestaMarcas.data)
            ? respuestaMarcas.data
            : []
        );

        setColores(
          Array.isArray(respuestaColores.data)
            ? respuestaColores.data
            : []
        );

        setVariantes(
          Array.isArray(respuestaVariantes.data)
            ? respuestaVariantes.data
            : []
        );

        console.log(
          "PRODUCTOS:",
          listaProductos
        );

        console.log(
          "MARCAS:",
          respuestaMarcas.data
        );

        console.log(
          "COLORES:",
          respuestaColores.data
        );

        console.log(
          "VARIANTES:",
          respuestaVariantes.data
        );
      } catch (error) {
        console.error(
          "Error al cargar catálogo:",
          error
        );

        setErrorCarga(
          error.message ||
            "No se pudo cargar el catálogo"
        );

        setProductos([]);
        setMarcas([]);
        setColores([]);
        setVariantes([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [setProductos]);

  /*
   * Relacionamos:
   *
   * id_producto -> colores del producto
   *
   * Ejemplo:
   * producto 5 -> color 1 y color 2
   */
  const coloresPorProducto = useMemo(() => {
    const mapa = new Map();

    variantes.forEach((variante) => {
      const productoId = String(
        variante.id_producto
      );

      const colorId = String(
        variante.id_color
      );

      if (!mapa.has(productoId)) {
        mapa.set(productoId, new Set());
      }

      mapa.get(productoId).add(colorId);
    });

    return mapa;
  }, [variantes]);

  const productosActivos = useMemo(() => {
    const lista = Array.isArray(productos)
      ? productos
      : [];

    return lista.filter((producto) => {
      const productoActivo = estaActivo(
        producto.estado
      );

      const subCategoriaActiva =
        producto.subCategoria?.estado ===
          undefined ||
        estaActivo(
          producto.subCategoria?.estado
        );

      const marcaActiva =
        !producto.marca ||
        estaActivo(producto.marca.estado);

      return (
        productoActivo &&
        subCategoriaActiva &&
        marcaActiva
      );
    });
  }, [productos]);

  const precioMaximo = useMemo(() => {
    const precios = productosActivos.map(
      (producto) =>
        convertirNumero(
          producto.precioVenta ??
            producto.precio_venta ??
            producto.precio
        )
    );

    const mayorPrecio = Math.max(
      0,
      ...precios
    );

    return Math.max(
      1,
      Math.ceil(mayorPrecio)
    );
  }, [productosActivos]);

  useEffect(() => {
    setFiltros((filtrosAnteriores) => {
      if (
        filtrosAnteriores.precioMax ===
        null
      ) {
        return {
          ...filtrosAnteriores,
          precioMax: precioMaximo,
        };
      }

      if (
        filtrosAnteriores.precioMax >
        precioMaximo
      ) {
        return {
          ...filtrosAnteriores,
          precioMax: precioMaximo,
        };
      }

      return filtrosAnteriores;
    });
  }, [precioMaximo]);

  const productosFiltrados = useMemo(() => {
    let lista = [...productosActivos];

    /*
     * Buscador.
     */
    if (textoBusqueda?.trim()) {
      const texto =
        normalizarTexto(textoBusqueda);

      lista = lista.filter((producto) =>
        normalizarTexto(
          producto.nombre
        ).includes(texto)
      );
    }

    /*
     * Género.
     */
    lista = lista.filter((producto) => {
      const idCategoria =
        producto.subCategoria?.categoria?.id ??
        producto.subCategoria?.categoriaId;

      return (
        Number(idCategoria) === categoriaId
      );
    });

    /*
     * Subcategoría.
     */
    if (subcategoriaParametro) {
      lista = lista.filter((producto) => {
        const idSubcategoria =
          producto.subCategoriaId ??
          producto.subCategoria?.id;

        return (
          Number(idSubcategoria) ===
          Number(subcategoriaParametro)
        );
      });
    }

    /*
     * Marca.
     *
     * El checkbox guarda id_marca.
     * Producto contiene marcaId.
     */
    if (
      Array.isArray(filtros.marcas) &&
      filtros.marcas.length > 0
    ) {
      const marcasSeleccionadas = new Set(
        filtros.marcas.map(String)
      );

      lista = lista.filter((producto) => {
        const marcaId = String(
          producto.marcaId ??
            producto.marca?.idMarca ??
            producto.marca?.id_marca ??
            ""
        );

        return marcasSeleccionadas.has(
          marcaId
        );
      });
    }

    /*
     * Color.
     *
     * El botón guarda el ID del color.
     * Después buscamos ese ID dentro
     * de las variantes del producto.
     */
    if (
      Array.isArray(filtros.colores) &&
      filtros.colores.length > 0
    ) {
      const coloresSeleccionados = new Set(
        filtros.colores.map(String)
      );

      lista = lista.filter((producto) => {
        const coloresDelProducto =
          coloresPorProducto.get(
            String(producto.id)
          );

        if (!coloresDelProducto) {
          return false;
        }

        for (const colorId of coloresSeleccionados) {
          if (
            coloresDelProducto.has(colorId)
          ) {
            return true;
          }
        }

        return false;
      });
    }

    /*
     * Precio.
     */
    const minimo = Number(
      filtros.precioMin ?? 0
    );

    const maximo = Number(
      filtros.precioMax ?? precioMaximo
    );

    lista = lista.filter((producto) => {
      const precio = convertirNumero(
        producto.precioVenta ??
          producto.precio_venta ??
          producto.precio
      );

      return (
        precio >= minimo &&
        precio <= maximo
      );
    });

    return lista;
  }, [
    productosActivos,
    textoBusqueda,
    categoriaId,
    subcategoriaParametro,
    filtros,
    precioMaximo,
    coloresPorProducto,
  ]);

  useEffect(() => {
    setPagina(1);
  }, [
    textoBusqueda,
    generoActual,
    subcategoriaParametro,
    filtros,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      productosFiltrados.length /
        PRODUCTOS_POR_PAGINA
    )
  );

  const paginaActual = Math.min(
    pagina,
    totalPaginas
  );

  const productosPagina = useMemo(() => {
    const inicio =
      (paginaActual - 1) *
      PRODUCTOS_POR_PAGINA;

    return productosFiltrados.slice(
      inicio,
      inicio + PRODUCTOS_POR_PAGINA
    );
  }, [
    productosFiltrados,
    paginaActual,
  ]);

  const paginasVisibles =
    obtenerPaginasVisibles(
      paginaActual,
      totalPaginas
    );

  const cambiarPagina = (nuevaPagina) => {
    const paginaSegura = Math.min(
      Math.max(1, nuevaPagina),
      totalPaginas
    );

    setPagina(paginaSegura);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filtrosParaComponente = {
    ...filtros,

    precioMax:
      filtros.precioMax ??
      precioMaximo,
  };

  return (
    <div className={Styles.divCatalogo}>
      <div
        className={
          Styles.filtroMobileWrapper
        }
      >
        <button
          type="button"
          className={
            Styles.btnFiltroMobile
          }
          onClick={() =>
            setOpenFiltro(true)
          }
        >
          <span>☰</span>
          Filtrar por
        </button>
      </div>

      <div className={Styles.catalogoLayout}>
        <aside
          className={
            Styles.containerFiltradoDesktop
          }
        >
          <Filtrado
            marcas={marcas}
            colores={colores}
            filtros={
              filtrosParaComponente
            }
            setFiltros={setFiltros}
            precioMaximo={precioMaximo}
          />
        </aside>

        <main className={Styles.catalogoMain}>
          {cargando && (
            <div
              className={
                Styles.estadoCatalogo
              }
            >
              Cargando productos...
            </div>
          )}

          {!cargando && errorCarga && (
            <div
              className={
                Styles.estadoCatalogo
              }
            >
              {errorCarga}
            </div>
          )}

          {!cargando &&
            !errorCarga &&
            productosFiltrados.length ===
              0 && (
              <div
                className={
                  Styles.estadoCatalogo
                }
              >
                No se encontraron productos.
              </div>
            )}

          {!cargando &&
            !errorCarga &&
            productosFiltrados.length > 0 && (
              <>
                <div
                  className={
                    Styles.containerCatalogo
                  }
                >
                  {productosPagina.map(
                    (producto) => (
                      <Card
                        key={producto.id}
                        onClick={() =>
                          router.push(
                            `/detalle/${producto.id}`
                          )
                        }
                        imagenCatalogo={
                          producto.imagen
                        }
                        marca={
                          producto.marca
                            ?.nombre ?? ""
                        }
                        nombre={
                          producto.nombre
                        }
                        precio={`S/. ${convertirNumero(
                          producto.precioVenta ??
                            producto.precio_venta ??
                            producto.precio
                        ).toFixed(2)}`}
                      />
                    )
                  )}
                </div>

                {totalPaginas > 1 && (
                  <nav
                    className={
                      Styles.paginacion
                    }
                    aria-label="Paginación del catálogo"
                  >
                    <button
                      type="button"
                      className={
                        Styles.botonPaginacionTexto
                      }
                      disabled={
                        paginaActual === 1
                      }
                      onClick={() =>
                        cambiarPagina(
                          paginaActual - 1
                        )
                      }
                    >
                      Anterior
                    </button>

                    {paginasVisibles.map(
                      (
                        paginaVisible,
                        indice
                      ) => {
                        if (
                          paginaVisible ===
                            "inicio" ||
                          paginaVisible ===
                            "fin"
                        ) {
                          return (
                            <span
                              key={`${paginaVisible}-${indice}`}
                              className={
                                Styles.paginacionPuntos
                              }
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={
                              paginaVisible
                            }
                            type="button"
                            className={`${Styles.botonPagina} ${
                              paginaActual ===
                              paginaVisible
                                ? Styles.paginaActiva
                                : ""
                            }`}
                            onClick={() =>
                              cambiarPagina(
                                paginaVisible
                              )
                            }
                          >
                            {paginaVisible}
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      className={
                        Styles.botonPaginacionTexto
                      }
                      disabled={
                        paginaActual ===
                        totalPaginas
                      }
                      onClick={() =>
                        cambiarPagina(
                          paginaActual + 1
                        )
                      }
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
              </>
            )}
        </main>
      </div>

      {openFiltro && (
        <div
          className={Styles.modalFiltro}
          onClick={() =>
            setOpenFiltro(false)
          }
        >
          <div
            className={Styles.modalContent}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                Styles.modalEncabezado
              }
            >
              <span>Filtros</span>

              <button
                type="button"
                className={
                  Styles.closeModal
                }
                onClick={() =>
                  setOpenFiltro(false)
                }
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>

            <Filtrado
              marcas={marcas}
              colores={colores}
              filtros={
                filtrosParaComponente
              }
              setFiltros={setFiltros}
              precioMaximo={
                precioMaximo
              }
              cerrarFiltro={() =>
                setOpenFiltro(false)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}