"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Style from "./mantExistencia.module.css";

export default function MantExistencia() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const id = params.id;

  const productoIdDesdeURL = searchParams.get("productoId");
  
  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  const [subCategoriasFiltradas, setSubCategoriasFiltradas] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const [idCategoria, setIdCategoria] = useState("");
  const [idSubCategoria, setIdSubCategoria] = useState("");
  const [idProducto, setIdProducto] = useState("");
  const [idColor, setIdColor] = useState("");
  const [idTalla, setIdTalla] = useState("");
  const [cantidad, setCantidad] = useState("");
  
  useEffect(() => {
    Promise.all([
      fetch("/api/categorias").then(r => r.json()),
      fetch("/api/subCategorias").then(r => r.json()),
      fetch("/api/productos").then(r => r.json()),
      fetch("/api/colores").then(r => r.json()),
      fetch("/api/tallas").then(r => r.json()),
    ]).then(([cat, sub, prod, col, tal]) => {
      setCategorias(cat);
      setSubCategorias(sub);
      setProductos(prod);
      setColores(col);
      setTallas(tal);
    });
  }, []);

  useEffect(() => {
    if (
      !productoIdDesdeURL ||
      productos.length === 0 ||
      subCategorias.length === 0
    ) {
      return;
    }

    const productoId = Number(productoIdDesdeURL);

    const producto = productos.find(
      p => Number(p.id) === productoId
    );

    if (!producto) {
      console.log("No se encontró el producto:", productoId);
      return;
    }

    const subCategoria = subCategorias.find(
      sc => Number(sc.id) === Number(producto.subCategoriaId)
    );

    if (!subCategoria) {
      console.log(
        "No se encontró la subcategoría:",
        producto.subCategoriaId
      );
      return;
    }

    const categoriaId = Number(subCategoria.categoriaId);
    const subCategoriaId = Number(subCategoria.id);

    setIdCategoria(String(categoriaId));
    setIdSubCategoria(String(subCategoriaId));
    setIdProducto(String(productoId));

    setSubCategoriasFiltradas(
      subCategorias.filter(
        sc => Number(sc.categoriaId) === categoriaId
      )
    );

    setProductosFiltrados(
      productos.filter(
        p => Number(p.subCategoriaId) === subCategoriaId
      )
    );
  }, [productoIdDesdeURL, productos, subCategorias]);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/variantes/${id}`)
      .then(res => res.json())
      .then(data => {

        const categoriaId = data.producto?.subCategoria.categoria.id;
        const subCategoriaId = data.producto?.subCategoria.id;
        const productoId = data.producto?.id;

        setSubCategoriasFiltradas(
          subCategorias.filter(
            sc => sc.categoriaId === categoriaId
          )
        );

        setProductosFiltrados(
          productos.filter(
            p => p.subCategoriaId === subCategoriaId
          )
        );

        setIdCategoria(categoriaId);
        setIdSubCategoria(subCategoriaId);
        setIdProducto(productoId);
        setIdColor(data.color?.id);
        setIdTalla(data.talla?.id);
        setCantidad(data.stock);

      });

  }, [id, subCategorias, productos]);
  
  const cambioCategoria = (e) => {
    const id = Number(e.target.value);
    setIdCategoria(id);
    setIdSubCategoria("");
    setIdProducto("");

    setSubCategoriasFiltradas(
      subCategorias.filter(sc => sc.categoriaId === id)
    );
    setProductosFiltrados([]);
  };

  const cambioSubCategoria = (e) => {
    const id = Number(e.target.value);
    setIdSubCategoria(id);
    setIdProducto("");

    setProductosFiltrados(
      productos.filter(p => p.subCategoriaId === id)
    );
  };

  const submitExistencia = async (e) => {
    e.preventDefault();

    try {

      const url = id
        ? `/api/variantes/${id}`
        : "/api/variantes";


      const method = id
        ? "PUT"
        : "POST";


      const body = {
        id_color: Number(idColor),
        id_talla: Number(idTalla),
        stock: Number(cantidad),
        ...( !id && {
          id_producto: Number(idProducto)
        })
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();


      if (!res.ok) {
        alert(data.mensaje || "Error al guardar");
        return;
      }

      alert(data.mensaje);

    } catch(error) {

      console.error(error);
      alert("Error interno al guardar");
    }
  };

  return (
    <div className={Style.mantExistencia}>
      <h1 className={Style.titulo}>
        {id ? "Editar Existencia" : "Añadir Existencia"}
      </h1>

      <form className={Style.formulario} onSubmit={submitExistencia}>
        {/* CATEGORIA */}
        <div className={Style.divCategoria}>
          <label>Categoría</label>
          <select
            className={Style.selectCategoria}
            value={idCategoria}
            onChange={cambioCategoria}
            disabled={!!productoIdDesdeURL}
            required
          >
            <option value="">Seleccionar</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* SUBCATEGORIA */}
        <div className={Style.divSubCategoria}>
          <label>Sub Categorías</label>
          <select
            className={Style.selectSubCategoria}
            value={idSubCategoria}
            onChange={cambioSubCategoria}
            disabled={!!productoIdDesdeURL}
            required
          >
            <option value="">Seleccionar sub categoría</option>
            {subCategoriasFiltradas.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.nombre}</option>
            ))}
          </select>
        </div>

        {/* PRODUCTO */}
        <div className={Style.divProducto}>
          <label>Seleccionar Producto:</label>
          <select
            className={Style.comboProductos}
            value={idProducto}
            onChange={e => setIdProducto(e.target.value)}
             disabled={!!id || !!productoIdDesdeURL}
            required
          >
            <option value="">-- Selecciona un producto --</option>
            {productosFiltrados.map(p => (
              <>
                <option key={p.id} value={p.id}>{p.nombre} - {p.marca?.nombre}</option>
              </>
            ))}
          </select>
        </div>

        {/* COLOR */}
        <div className={Style.divColor}>
          <label>Color</label>
          <select
            className={Style.selectColores}
            value={idColor}
            onChange={e => setIdColor(e.target.value)}
          >
            <option value="">-- Selecciona un color --</option>
            {colores.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* TALLA */}
        <div className={Style.divTalla}>
          <label>Talla</label>
          <select
            className={Style.selectTallas}
            value={idTalla}
            onChange={e => setIdTalla(e.target.value)}
          >
            <option value="">-- Selecciona una talla --</option>
            {tallas.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        {/* CANTIDAD */}
        <div className={Style.divCantidad}>
          <label>Cantidad</label>
          <input
            className={Style.inputCantidad}
            type="number"
            min="1"
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            required
          />
        </div>

        {/* BOTONES */}
        <div className={Style.divBotones}>
          <button className={Style.btnGuardarCambios} type="submit">
            Guardar Cambios
          </button>
          <button
            type="button"
            className={Style.btnVerExistencias}
            onClick={() => router.push("/FormExistencias")}
          >
            Ver Existencias
          </button>
        </div>
      </form>
    </div>
  );
}