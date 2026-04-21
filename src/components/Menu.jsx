"use client";

import { useRouter } from "next/navigation";
import Style from "./menu.module.css";

import { useMenuStore } from "@/store/MenuStore";
import { useUsuarioStore } from "@/store/UsuarioStore";

export default function Menu() {
  const router = useRouter();
  const cerrarMenu = useMenuStore((state) => state.cerrarMenu);
  const usuario = useUsuarioStore((state) => state.usuario);

  if (!usuario) return null;

  const ir = (ruta) => {
    cerrarMenu();
    router.push(ruta);
  };

  return (
    <aside className={Style.contentMenu}>

      <div
        className={Style.contentMantenimientoUsuario}
        onClick={() => ir("/post")}
      >
        + Nuevo Comprobante
      </div>

      {/* Preventa */}
      <div
        className={Style.contentPreventa}
        onClick={() => ir("/PreVenta")}
      >
        Preventa
      </div>

      {/* Ventas */}
      <div
        className={Style.contentVentas}
        onClick={() => ir("/Ventas")}
      >
        Ventas
      </div>

      {usuario.cargo !== "Vendedor" ? (
        <>

          <div
            className={Style.contentMantenimientoProductos}
            onClick={() => ir("/MantProductos")}
          >
            Mant. Productos
          </div>

          <div
            className={Style.contentMantenimientoMarcas}
            onClick={() => ir("/MantMarcas")}
          >
            Mant. Marcas
          </div>

          <div
            className={Style.contentMantenimientoCategorias}
            onClick={() => ir("/MantCategorias")}
          >
            Mant. Categorías
          </div>

          <div
            className={Style.contentMantenimientoSubCategorias}
            onClick={() => ir("/MantSubCategorias")}
          >
            Mant. Subcategorías
          </div>

          <div
            className={Style.contentMantenimientoTallas}
            onClick={() => ir("/MantTalla")}
          >
            Mant. Tallas
          </div>

          <div
            className={Style.contentMantenimientoColor}
            onClick={() => ir("/MantColor")}
          >
            Mant. Colores
          </div>

          <div
            className={Style.contentMantenimientoUsuario}
            onClick={() => ir("/MantUsuario")}
          >
            Mant. Usuarios
          </div>
        </>
      ) : (
        <div className={Style.disabled}></div>
      )}
    </aside>
  );
}