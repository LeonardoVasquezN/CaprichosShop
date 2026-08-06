import { NextResponse } from "next/server";
import { verificarSesion } from "@/lib/auth";

export async function GET() {
  const usuario = await verificarSesion();

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "Sesión expirada" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    usuario,
  });
}