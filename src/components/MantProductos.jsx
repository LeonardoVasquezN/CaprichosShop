"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Style from "./mantProductos.module.css";
import { fetchSeguro } from "@/lib/fetchSeguro";

export default function MantProductos() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ?? null;

  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [subCategoriaFiltrada, setSubCategoriaFiltrada] = useState([]);

  const [idSubCategorias, setIdSubCategorias] = useState("");
  const [idMarca, setIdMarca] = useState("");
  const [nombre, setNombre] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [imagen, setImagen] = useState(null);

  const [nombreCategoriaEdit, setNombreCategoriaEdit] = useState("");
  const [nombreSubCategoriaEdit, setNombreSubCategoriaEdit] = useState("");
  const [nombreMarcaEdit, setNombreMarcaEdit] = useState("");

  const [imagenActual, setImagenActual] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categorias").then(r => r.json()),
      fetch("/api/subCategorias").then(r => r.json()),
      fetch("/api/marcas").then(r => r.json()),
    ]).then(([cat, sub, mar]) => {
      setCategorias(cat);
      setSubCategorias(sub);
      setMarcas(mar);
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    const cargarProducto = async () => {
      // Vamos a implementar el fetchSeguro
      const res = await fetchSeguro(`/api/productos/${id}`);

      if(!res) return;
      if (!res.ok) return;

      const data = await res.json();

      setNombre(data.nombre ?? "");
      setPrecioCompra(String(data.precioCompra ?? ""));
      setPrecioVenta(String(data.precioVenta ?? ""));
      setIdSubCategorias(String(data.subCategoriaId ?? ""));
      setIdMarca(String(data.marcaId ?? ""));

      setNombreSubCategoriaEdit(data.subCategoria?.nombre ?? "");
      setNombreCategoriaEdit(
        data.subCategoria?.categoria?.nombre ?? ""
      );
      setNombreMarcaEdit(data.marca?.nombre ?? "");
      setImagenActual(data.imagen ?? "");
    };

    cargarProducto();
  }, [id]);

  const manejoCategoriaFiltro = (e) => {
    const idCategoria = Number(e.target.value);

    const filtradas = subCategorias.filter(
      sc => sc.categoriaId === idCategoria
    );

    setSubCategoriaFiltrada(filtradas);
    setIdSubCategorias("");
  };

  const submitProductos = async (e) => {
    e.preventDefault();

    if (guardando) return;

    if (!idSubCategorias) {
      alert("Debes seleccionar una subcategoría");
      return;
    }

    if (!idMarca) {
      alert("Debes seleccionar una marca");
      return;
    }

    setGuardando(true);

    try {
      const formData = new FormData();

      formData.append("id_sub_categorias", idSubCategorias);
      formData.append("id_marca", idMarca);
      formData.append("nombre", nombre);
      formData.append("precio_compra", precioCompra);
      formData.append("precio_venta", precioVenta);

      if (imagen) {
        formData.append("imagen", imagen);
      }

      const res = await fetchSeguro(
        id ? `/api/productos/${id}` : "/api/productos",
        {
          method: id ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!res) return;

      if (!res.ok) {
        const err = await res.json();

        if (res.status === 409) {
          alert(err.mensaje);
          return;
        }

        console.error(err);
        alert("Error al guardar producto");
        return;
      }

      alert(id ? "Producto actualizado" : "Producto agregado");
      router.push("/FormProductos");

    } catch (error) {
      console.error("ERROR AL GUARDAR PRODUCTO:", error);
      alert("Error inesperado al guardar el producto");

    } finally {
      setGuardando(false);
    }
  };

  const irAMantenimientoExistencia = () => {
    router.push(`/MantExistencia?productoId=${id}`);
  };

  return (
  <div className={Style.mantProductos}>
    <h1 className={Style.titulo}>
      {id ? "EDITAR PRODUCTO" : "AGREGAR PRODUCTO"}
    </h1>

    <form className={Style.formulario} onSubmit={submitProductos}>

      {/* Categoría */}
      <div className={Style.grupoCategoria}>
        <label>Categoría</label>

        {!id ? (
          <select
            className={Style.select}
            onChange={manejoCategoriaFiltro}
            required
          >
            <option value="">Seleccionar</option>

            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        ) : (
          <select className={Style.select} disabled>
            <option>{nombreCategoriaEdit}</option>
          </select>
        )}
      </div>

      {/* Subcategoria */}

      <div className={Style.grupoSubCategoria}>
        <label>Subcategoría</label>

        {!id ? (
          <select
            className={Style.select}
            value={idSubCategorias}
            onChange={(e) => setIdSubCategorias(e.target.value)}
            required
          >
            <option value="">Seleccionar</option>

            {subCategoriaFiltrada.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.nombre}
              </option>
            ))}
          </select>
        ) : (
          <select className={Style.select} disabled>
            <option>{nombreSubCategoriaEdit}</option>
          </select>
        )}
      </div>

      {/* Marca */}

      <div className={Style.grupoMarca}>
        <label>Marca</label>

        {!id ? (
          <select
            className={Style.select}
            value={idMarca}
            onChange={(e) => setIdMarca(e.target.value)}
            required
          >
            <option value="">Seleccionar</option>

            {marcas.map((m) => (
              <option key={m.idMarca} value={m.idMarca}>
                {m.nombre}
              </option>
            ))}
          </select>
        ) : (
          <select className={Style.select} disabled>
            <option>{nombreMarcaEdit}</option>
          </select>
        )}
      </div>

      {/* Producto */}

      <div className={Style.grupoProducto}>
        <label>Producto</label>

        <input
          className={Style.input}
          placeholder="Nombre de producto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {/* Imagen */}

      <div className={Style.grupoImagen}>
        <div className={Style.dropZoneContainer}>
          <label className={Style.dropZone}>
            <input
              type="file"
              className={Style.inputFile}
              onChange={(e) => setImagen(e.target.files[0])}
            />
            <div className={Style.icono}>📷</div>
            <p>
              Arrastra y suelta tu imagen
              <br />
              aquí o haz clic
            </p>
          </label>
          {/* Preview de imagen nueva seleccionada */}
            {imagen && (
              <div className={Style.preview}>
                <img
                  src={URL.createObjectURL(imagen)}
                  alt="Preview"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
              </div>
            )}
            {/* Preview de imagen existente en edición */}
            {!imagen && imagenActual && (
              <div className={Style.preview}>
                <img
                  src={imagenActual}
                  alt="Imagen actual"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              </div>
            )}
        </div>
      </div>

      {/* Precio Compra */}

      <div className={Style.grupoCompra}>
        <label>Precio Compra</label>

        <input
          type="number"
          className={Style.input}
          placeholder="S/ Precio Compra"
          value={precioCompra}
          onChange={(e) => setPrecioCompra(e.target.value)}
          required
        />
      </div>

      {/* Precio Venta */}

      <div className={Style.grupoVenta}>
        <label>Precio Venta</label>

        <input
          type="number"
          className={Style.input}
          placeholder="S/ Precio Venta"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(e.target.value)}
          required
        />
      </div>

      {/* Botones */}

      <div className={Style.botones}>

        <button
          type="submit"
          className={Style.btnPrincipal}
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : id
              ? "Actualizar Producto"
              : "Agregar Producto"}
        </button>

        <button
          type="button"
          className={Style.btnSecundario}
          onClick={() => router.push("/FormProductos")}
        >
          Ver Productos
        </button>

       { id && (
          <button
            type="button"
            className={Style.btnSecundario}
            onClick={irAMantenimientoExistencia}
          >
            Añadir Existencia
          </button>
        )}

      </div>

    </form>

  </div>
);
}