import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const marcas = await prisma.marca.findMany({
      select: {
        idMarca: true,
        nombre: true,
        estado: true,
      },
      orderBy: { idMarca: "asc" },
    });

    const marcasJSON = serializeBigInt(marcas);

    return NextResponse.json(marcasJSON, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/marcas error:", error);

    return NextResponse.json(
      { mensaje: "Error al obtener marcas" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { nombre } = await req.json();

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const nombreLimpio = nombre.trim();

    const marcaExistente = await prisma.marca.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
    });

    if (marcaExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe una marca con ese nombre" },
        { status: 409 }
      );
    }

    const marca = await prisma.marca.create({
      data: {
        nombre: nombreLimpio,
        estado: 1,
      },
    });

    const marcasJSON = serializeBigInt(marcas);

    return NextResponse.json(marcaJSON, { status: 201 });
  } catch (error) {
    console.error("POST /api/marcas error:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar marca" },
      { status: 500 }
    );
  }
}