import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const serializeBigInt = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint"
        ? Number(value)
        : value
    )
  );

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