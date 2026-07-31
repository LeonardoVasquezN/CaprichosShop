"use client";

import { useEffect, useState } from "react";
import Style from "./formUsuarios.module.css";
import { useRouter } from "next/navigation";
import API_URL from "../config";

export default function FormUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/usuarios`)
      .then((res) => res.json())
      .then(setUsuarios)
      .catch(console.error);
  }, []);

  const irAMantUsuario = () => router.push("/MantUsuario");

  const irAMantUsuarioId = (id) => {
    router.push(`/MantUsuario/${id}`);
  };

  return (
    <div className={Style.contentUsuarios}>
      <h1 className={Style.titulo}>Usuarios</h1>

      <button className={Style.btnAddUsuario} onClick={irAMantUsuario}>
        Añadir Usuarios
      </button>

      <table className={Style.tablaUsuarios}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>
                <button
                  className={Style.btnEditar}
                  onClick={() => irAMantUsuarioId(usuario.id)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}