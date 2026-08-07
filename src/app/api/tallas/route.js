import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tallas = await prisma.talla.findMany();
    return NextResponse.json(tallas);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al obtener tallas" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const nombreLimpio = nombre.trim();

    const tallaExistente = await prisma.talla.findFirst({
      where: {
        nombre: nombreLimpio,
      },
    });

    if (tallaExistente) {
      return NextResponse.json(
        { mensaje: "La talla ya existe" },
        { status: 409 }
      );
    }

    const talla = await prisma.talla.create({
      data: {
        nombre: nombreLimpio,
        isActivo: true,
      },
    });

    return NextResponse.json(
      {
        mensaje: "Talla guardada con éxito",
        talla,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al guardar talla" },
      { status: 500 }
    );
  }
}