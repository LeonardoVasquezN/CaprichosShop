import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      select: {
        id: true,
        nombre: true,
      },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al obtener categorías" },
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

    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre: nombreLimpio,
        estado: 1,
      },
    });

    return NextResponse.json(
      {
        mensaje: "Categoría guardada con éxito",
        categoria,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/categorias error:", error);

    return NextResponse.json(
      { mensaje: "Error al guardar categoría" },
      { status: 500 }
    );
  }
}