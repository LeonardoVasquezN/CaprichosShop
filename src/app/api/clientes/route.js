import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  

// GET: listar clientes
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nombre: true,
        documento: true,
      },
      take: 100, // opcional: limitar resultados para evitar latencia
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("Error en GET /api/clientes:", error);
    return NextResponse.json(
      { message: "Error interno al obtener clientes" },
      { status: 500 }
    );
  }
}

// POST: crear cliente
export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, documento } = body;

    if (!nombre || !documento) {
      return NextResponse.json(
        { message: "Nombre y documento son obligatorios" },
        { status: 422 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        documento,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/clientes:", error);
    return NextResponse.json(
      { message: "Error interno al crear cliente" },
      { status: 500 }
    );
  }
}
