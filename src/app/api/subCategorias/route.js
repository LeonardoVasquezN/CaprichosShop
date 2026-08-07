import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const subCategorias = await prisma.subCategoria.findMany({
      select: {
        id: true,
        nombre: true,
        estado: true,
        categoriaId: true,
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(subCategorias);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al obtener subcategorías" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
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

    const subCategoria = await prisma.subCategoria.create({
      data: {
        nombre: nombreLimpio,
        estado: 1,
        categoriaId: categoriaId,
      },
    });

    return NextResponse.json(
      {
        mensaje: "Subcategoría guardada con éxito",
        subCategoria,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/subCategorias error:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar subcategoría" },
      { status: 500 }
    );
  }
}