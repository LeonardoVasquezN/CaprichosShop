import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);

    const detalle = await prisma.detallePreVenta.findUnique({
      where: {
        id,
      },
    });

    if (!detalle) {
      return NextResponse.json(
        { mensaje: "Detalle no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      serializeBigInt(detalle)
    );

  } catch (error) {
    console.error("ERROR GET DETALLE PREVENTA:", error);

    return NextResponse.json(
      {
        error: "Error al obtener detalle de preventa",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}