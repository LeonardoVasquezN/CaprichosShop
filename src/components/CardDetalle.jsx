"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import styles from "./cardDetalle.module.css";
import { useCarritoStore } from "@/store/CarritoStore";

const PLACEHOLDER = "/images/placeholder.png";

export default function CardDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const agregarProducto = useCarritoStore((s) => s.agregarProducto);

  const [producto, setProducto] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [relacionados, setRelacionados] = useState([]);

  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (!id) return;

    const cargarDetalle = async () => {
      try {
        /* PRODUCTO */
        const resProducto = await fetch(`/api/productos/${id}`);
        const dataProducto = await resProducto.json();
        setProducto(dataProducto);

        /* VARIANTES */
        const resVariantes = await fetch("/api/variantes");
        const dataVariantes = await resVariantes.json();

        const variantesProducto = dataVariantes.filter(
          (v) => v.productoId === Number(id)
        );

        setVariantes(variantesProducto);

        const varianteInicial = variantesProducto.find(
          (v) =>
            v.color?.estado === 1 &&
            v.talla?.isActivo === true &&
            v.stock > 0
        );

        if (varianteInicial) {
          setColorSeleccionado(varianteInicial.colorId);
          setTallaSeleccionada(varianteInicial.tallaId);
        }

        /* RELACIONADOS */
        const resRelacionados = await fetch("/api/productos");
        const todos = await resRelacionados.json();

        setRelacionados(
          todos.filter(
            (p) =>
              p.subCategoriaId === dataProducto.subCategoriaId &&
              p.id !== dataProducto.id
          )
        );
      } catch (error) {
        console.error("Error cargando detalle:", error);
      }
    };

    cargarDetalle();
  }, [id]);

  if (!producto) return <p>Cargando producto...</p>;

  const coloresDisponibles = [
    ...new Map(
      variantes
        .filter((v) =>
          v.color?.estado === 1 &&
          v.talla?.isActivo === true &&
          v.stock > 0
        )
        .map((v) => [v.colorId, v.color])
    ).values(),
  ];

  const tallasParaColor = variantes
    .filter(
      (v) =>
        v.colorId === colorSeleccionado &&
        v.talla?.isActivo === true
    )
    .map((v) => ({
      id: v.tallaId,
      nombre: v.talla.nombre,
      stock: v.stock,
    }));

  const tallaObj = tallasParaColor.find(
    (t) => t.id === tallaSeleccionada
  );

  const deshabilitado =
    !tallaObj || tallaObj.stock === 0 || cantidad > tallaObj.stock;

  const handleAgregar = () => {
    if (deshabilitado) return;

    agregarProducto({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precioVenta,
      color: variantes.find(
        (v) => v.colorId === colorSeleccionado
      )?.color.nombre,
      talla: variantes.find(
        (v) => v.tallaId === tallaSeleccionada
      )?.talla.nombre,
      color_id: colorSeleccionado,
      talla_id: tallaSeleccionada,
      cantidad,
      imagen: producto.imagen || PLACEHOLDER,
    });

    setCantidad(1);
  };

  return (
    <div className={styles.contentCardDetalle}>
      <div className={styles.contentTituloCardDetalle}>
        <span className={styles.tituloCardDetalle}>
          {producto.nombre}
        </span>
      </div>

      <div className={styles.contentCardDetalleImagen}>
        <Image
          src={producto.imagen || PLACEHOLDER}
          alt={producto.nombre}
          width={350}
          height={380}
          className={styles.estiloImagen}
          priority
        />
      </div>

      <div className={styles.contentCardDetalleDescripcion}>
        <h2 className={styles.estiloNombre}>{producto.nombre}</h2>
        <p className={styles.estiloPrecio}>
          S/. {producto.precioVenta}
        </p>
        
        <div className={styles.estiloContentColorDisponibles}>
          {coloresDisponibles.map((color) => (
            <div
              key={color.id}
              className={`${styles["color-box"]} ${
                colorSeleccionado === color.id
                  ? styles.seleccionado
                  : ""
              }`}
              style={{ backgroundColor: color.hexadecimal }}
              onClick={() => {
                setColorSeleccionado(color.id);

                const primeraTalla = variantes.find(
                  (v) =>
                    v.colorId === color.id &&
                    v.talla?.isActivo === true &&
                    v.stock > 0
                )?.tallaId;

                setTallaSeleccionada(primeraTalla || null);
                setCantidad(1);
              }}
            />
          ))}
        </div>

        <div className={styles.estiloContentTallasDisponibles}>
          {tallasParaColor.map((t) => (
            <div
              key={t.id}
              className={`${styles["talla-box"]} ${
                tallaSeleccionada === t.id
                  ? styles.seleccionado
                  : ""
              } ${t.stock === 0 ? styles["sin-stock"] : ""}`}
              onClick={() =>
                t.stock > 0 && setTallaSeleccionada(t.id)
              }
            >
              <div className={styles["talla-nombre"]}>
                {t.nombre}
              </div>
              <span className={styles.estiloNumeroDeStock}>
                {t.stock}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.estiloContentAddCar}>
          <div className={styles.estiloContentAddMASMENOS}>
            <div
              className={styles.estiloMenosIMG}
              onClick={() =>
                setCantidad((c) => Math.max(1, c - 1))
              }
            >
              <span className={styles.spanMenos}>-</span>
            </div>

            <span>{cantidad}</span>

            <div
              className={styles.estiloMasIMG}
              onClick={() => setCantidad((c) => c + 1)}
            >
              <span className={styles.spanMas}>+</span>
            </div>
          </div>

          <button
            className={`${styles.estiloContentAddProductCar} ${
              deshabilitado ? styles.disabled : ""
            }`}
            disabled={deshabilitado}
            onClick={handleAgregar}
          >
            <span className={styles.spanAddCarrito}>
              AÑADIR AL CARRITO
            </span>
          </button>
        </div>

      </div>

      <h3 className={styles.tituloProductoRelacionado}>
        PRODUCTOS RELACIONADOS
      </h3>

      <div className={styles.contentProductCarrusel}>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={4}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {relacionados.map((p) => (
            <SwiperSlide key={p.id}>
              <div
                className={styles.productoSlide}
                onClick={() =>
                  router.push(`/detalle/${p.id}`)
                }
              >
                <Image
                  src={p.imagen || PLACEHOLDER}
                  alt={p.nombre}
                  width={250}
                  height={250}
                  className={styles.imagenSlide}
                />
                <p className={styles.nombreSlide}>{p.nombre}</p>
                <p className={styles.precioSlide}>
                  S/. {p.precioVenta}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}