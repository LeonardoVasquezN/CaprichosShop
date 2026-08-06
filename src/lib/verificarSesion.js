import { useUsuarioStore } from "@/store/UsuarioStore";

export async function verificarSesionFront() {
  const response = await fetch("/api/verificarSesion");

  if (response.status === 401) {
    useUsuarioStore.getState().cerrarSesion();
    return false;
  }

  return true;
}