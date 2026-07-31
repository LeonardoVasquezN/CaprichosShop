"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./mantExistencia.module.css";

export default function MantExistencia() {
  const router = useRouter();
  
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
      const res = await fetch("/api/variantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_producto: Number(idProducto),
          id_color: Number(idColor),
          id_talla: Number(idTalla),
          stock: Number(cantidad),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al guardar existencia");
        return;
      }

      alert(data.mensaje);
      // router.push("/FormExistencias");
    } catch (error) {
      console.error(error);
      alert("Error interno al guardar existencia");
    }
  };

  return (
    <div className={Style.mantExistencia}>
      <h1 className={Style.titulo}>Añadir Existencia</h1>

      <form className={Style.formulario} onSubmit={submitExistencia}>
        {/* CATEGORIA */}
        <div className={Style.divCategoria}>
          <label>Categoría</label>
          <select
            className={Style.selectCategoria}
            value={idCategoria}
            onChange={cambioCategoria}
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
            required
          >
            <option value="">-- Selecciona un producto --</option>
            {productosFiltrados.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
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