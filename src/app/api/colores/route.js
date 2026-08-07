import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const colores = await prisma.color.findMany();
    return NextResponse.json(colores);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al obtener colores" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, hexadecimal } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    const nombreLimpio = nombre.trim();

    const colorExistente = await prisma.color.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
    });

    if (colorExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe un color con ese nombre" },
        { status: 409 }
      );
    }

    const color = await prisma.color.create({
      data: {
        nombre: nombreLimpio,
        hexadecimal: hexadecimal || null,
        estado: 1,
      },
    });

    return NextResponse.json(color, { status: 201 });

  } catch (error) {
    console.error("POST /api/colores error:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar color" },
      { status: 500 }
    );
  }
}