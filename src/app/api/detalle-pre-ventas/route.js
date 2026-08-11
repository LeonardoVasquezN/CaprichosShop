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