"use client";

import Image from "next/image";

export default function ProductAutocomplete({
  estiloProductAutoComplete,
  estiloContainerImagen,
  estiloImagen,
  imagen,

  estiloContentDescripcion,
  estiloMarca,
  estiloNombre,
  estiloCategoria,

  estiloPrecio,
  precio,

  estiloContentBoton,
  textoBoton,
  estiloBoton,
  estiloTextoBoton,

  marca,
  nombre,
  categoria, 

  eventoOnClick,
}) {
  return (
    <div className={estiloProductAutoComplete} onClick={eventoOnClick}>
      
      {/* IMAGEN */}
      <div className={estiloContainerImagen}>
        <Image
          src={imagen || "/images/placeholder.jpg"}
          alt={nombre}
          className={estiloImagen}
          width={60}
          height={60}
        />
      </div>

      {/* INFO (MARCA + NOMBRE + CATEGORIA) */}
      <div className={estiloContentDescripcion}>
        
        <div>
          <span className={estiloMarca}>{marca}</span>
          <span> | </span>
          <span className={estiloNombre}>{nombre}</span>
        </div>

        <span className={estiloCategoria}>
          {categoria || "Hombre"}
        </span>

      </div>

      {/* PRECIO */}
      <div>
        <span className={estiloPrecio}>{precio}</span>
      </div>

      {/* BOTÓN */}
      <div className={estiloContentBoton}>
        <button
          className={estiloBoton}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className={estiloTextoBoton}>{textoBoton}</span>
        </button>
      </div>

    </div>
  );
}