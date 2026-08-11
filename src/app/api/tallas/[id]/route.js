import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";
import { serializeBigInt } from "@/lib/serialize";

export async function GET(req) {
  try {
    const id = Number(
      req.nextUrl.pathname.split("/").pop()
    );

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

    return NextResponse.json(serializarBigInt(talla));
  } catch (error) {
    console.error("GET /api/tallas/[id] error:", error);

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

    const id = Number(
      req.nextUrl.pathname.split("/").pop()
    );

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const nombreLimpio = body.nombre?.trim();

    if (!nombreLimpio || typeof nombreLimpio !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const tallaExistente = await prisma.talla.findFirst({
      where: {
        nombre: nombreLimpio,
        NOT: {
          id,
        },
      },
    });

    if (tallaExistente) {
      return NextResponse.json(
        { mensaje: "La talla ya existe" },
        { status: 409 }
      );
    }

    const tallaActualizada = await prisma.talla.update({
      where: { id },
      data: {
        nombre: nombreLimpio,
        isActivo:
          body.isActivo !== undefined
            ? Boolean(body.isActivo)
            : undefined,
      },
    });

    return NextResponse.json({
      mensaje: "Talla actualizada con éxito",
      talla: serializarBigInt(tallaActualizada),
    });
  } catch (error) {
    console.error("Error al actualizar talla:", error);

    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}