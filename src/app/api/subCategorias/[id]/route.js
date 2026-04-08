import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const { id } = params;
  const subCategoriaId = Number(id);

  if (isNaN(subCategoriaId)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const actualizado = await prisma.subCategoria.update({
      where: { id: subCategoriaId },
      data: {
        estado: body.estado,
      },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { mensaje: "Error al actualizar" },
      { status: 500 }
    );
  }
}