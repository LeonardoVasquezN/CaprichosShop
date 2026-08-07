import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export async function GET(_req, { params }) {
  const { id } = params; 
  const subCategoriaId = Number(id);

  if (isNaN(subCategoriaId)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  const subCategoria = await prisma.subCategoria.findUnique({
    where: { id: subCategoriaId },
  });

  if (!subCategoria) {
    return NextResponse.json(
      { mensaje: "SubCategoría no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(subCategoria);
}

export async function PUT(req, { params }) {

  const usuario = await verificarAdmin();

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "No autorizado" },
      { status: 403 }
    );
  }

  const { id } = params;
  const subCategoriaId = Number(id);

  if (isNaN(subCategoriaId)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  try {

    const subCategoria = await prisma.subCategoria.findUnique({
      where: { id: subCategoriaId },
    });

    if (!subCategoria) {
      return NextResponse.json(
        { mensaje: "Subcategoría no encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { nombre, id_categorias } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    if (!id_categorias || isNaN(Number(id_categorias))) {
      return NextResponse.json(
        { mensaje: "La categoría es obligatoria" },
        { status: 422 }
      );
    }

    const nombreLimpio = nombre.trim();
    const categoriaId = Number(id_categorias);

    const subCategoriaExistente = await prisma.subCategoria.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
        categoriaId: categoriaId,
        NOT: {
          id: subCategoriaId,
        },
      },
    });

    if (subCategoriaExistente) {
      return NextResponse.json(
        {
          mensaje: "Ya existe una subcategoría con ese nombre en esta categoría",
        },
        { status: 409 }
      );
    }

    const actualizado = await prisma.subCategoria.update({
      where: { id: subCategoriaId },
      data: {
        nombre: nombreLimpio,
        categoriaId: categoriaId,
      },
    });

    return NextResponse.json({
      mensaje: "Subcategoría actualizada correctamente",
      subCategoria: actualizado,
    });

  } catch (error) {

    console.error("PUT /api/subCategorias/[id] error:", error);

    return NextResponse.json(
      { mensaje: "Error al actualizar subcategoría" },
      { status: 500 }
    );
  }
}