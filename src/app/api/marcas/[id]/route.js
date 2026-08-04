import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const idMarca = Number(id);

    if (isNaN(idMarca)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const marca = await prisma.marca.findUnique({
      where: { idMarca },
      select: {
        idMarca: true,
        nombre: true,
        estado: true,
      },
    });

    if (!marca) {
      return NextResponse.json(
        { mensaje: "Marca no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(marca);
  } catch (error) {
    console.error("GET /api/marcas/[id] error:", error);
    return NextResponse.json(
      { mensaje: "Error al cargar marca" },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {

    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { mensaje: "No autorizado" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const idMarca = Number(id);

    if (isNaN(idMarca)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const marcaActualizada = await prisma.marca.update({
      where: { idMarca },
      data: {
        nombre: body.nombre,
        estado: body.estado,
      },
    });

    return NextResponse.json(marcaActualizada);
  } catch (error) {
    console.error("PUT /api/marcas/[id] error:", error);
    return NextResponse.json(
      { mensaje: "Error al actualizar marca" },
      { status: 500 }
    );
  }
}