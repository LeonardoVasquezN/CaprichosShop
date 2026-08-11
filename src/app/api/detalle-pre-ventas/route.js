import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const detalles = await prisma.detallePreVenta.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(
      serializeBigInt(detalles)
    );

  } catch (error) {
    console.error("ERROR GET DETALLE PREVENTA:", error);

    return NextResponse.json(
      {
        error: "Error al obtener detalles de preventa",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}