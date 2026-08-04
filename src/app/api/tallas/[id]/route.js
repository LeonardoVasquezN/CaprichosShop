import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export async function GET(req) {
  try {
    const id = Number(req.nextUrl.pathname.split("/").pop());

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const talla = await prisma.talla.findUnique({
      where: { id },
    });

    if (!talla) {
      return NextResponse.json(
        { mensaje: "Talla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(talla);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {

    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { mensaje: "No autorizado" },
        { status: 403 }
      );
    }

    const id = Number(req.nextUrl.pathname.split("/").pop());

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const tallaActualizada = await prisma.talla.update({
      where: { id },
      data: {
        nombre: body.nombre,
        isActivo:
          body.isActivo !== undefined
            ? Boolean(body.isActivo)
            : undefined,
      },
    });

    return NextResponse.json({
      mensaje: "Talla actualizada con éxito",
      talla: tallaActualizada,
    });
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}