import { useUsuarioStore } from "@/store/UsuarioStore";

export async function fetchSeguro(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    useUsuarioStore.getState().cerrarSesion();

    alert("Tu sesión ha expirado.");

    window.location.href = "/";
    return null;
  }

  return response;
}