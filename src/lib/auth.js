import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function verificarSesion() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return usuario;
  } catch (error) {
    return null;
  }
}