import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export async function GET(_req, context) {
  const params = await context.params; 
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  const categoria = await prisma.categoria.findUnique({
    where: { id: id }, 
  });

  if (!categoria) {
    return NextResponse.json(
      { mensaje: "Categoría no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(categoria);
}


export async function PUT(req, context) {

  const usuario = await verificarAdmin();

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "No autorizado" },
      { status: 403 }
    );
  }

  try {

    const params = await context.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return NextResponse.json(
        { mensaje: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const { nombre } = await req.json();

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const nombreLimpio = nombre.trim();

    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
        NOT: {
          id: id,
        },
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe otra categoría con ese nombre" },
        { status: 409 }
      );
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: nombreLimpio,
      },
    });

    return NextResponse.json({
      mensaje: "Categoría actualizada con éxito",
      categoria: categoriaActualizada,
    });

  } catch (error) {

    console.error("PUT /api/categorias/[id] error:", error);

    return NextResponse.json(
      { mensaje: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}