import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export async function GET(_req, { params }) {
  const { id } = await params; 

  const colorId = Number(id);
  if (isNaN(colorId)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  const color = await prisma.color.findUnique({
    where: { id: colorId },
  });

  if (!color) {
    return NextResponse.json(
      { mensaje: "Color no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(color);
}

export async function PUT(req, { params }) {
  try {

    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { mensaje: "No autorizado" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const colorId = Number(id);

    if (isNaN(colorId)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.nombre || typeof body.nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const nombreLimpio = body.nombre.trim();

    const colorExistente = await prisma.color.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
        NOT: {
          id: colorId,
        },
      },
    });

    if (colorExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe otro color con ese nombre" },
        { status: 409 }
      );
    }

    const color = await prisma.color.update({
      where: { id: colorId },
      data: {
        nombre: nombreLimpio,
        hexadecimal: body.hexadecimal,
        estado: body.estado,
      },
    });

    return NextResponse.json(color);

  } catch (error) {
    console.error("PUT /api/colores/[id] error:", error);

    return NextResponse.json(
      { mensaje: "Error al actualizar color" },
      { status: 500 }
    );
  }
}