import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const serializeBigInt = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );

export async function POST(req) {
  try {
    const {
      venta_id,
      producto_id,
      variante_id,
      cantidad,
      precio_unitario,
      total,
    } = await req.json();

    if (
      !venta_id ||
      !producto_id ||
      !variante_id ||
      cantidad == null ||
      precio_unitario == null ||
      total == null
    ) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 422 }
      );
    }

    const detalle = await prisma.detalleVenta.create({
      data: {
        ventaId: Number(venta_id),
        productoId: Number(producto_id),
        varianteId: Number(variante_id),
        cantidad: Number(cantidad),
        precioUnitario: new Prisma.Decimal(precio_unitario),
        total: new Prisma.Decimal(total),
      },
    });

    return NextResponse.json(
      serializeBigInt(detalle),
      { status: 201 }
    );

  } catch (error) {
    console.error("ERROR POST /api/detalle-ventas:", error);

    return NextResponse.json(
      {
        error: "Error al guardar detalle venta",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const detalles = await prisma.detalleVenta.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(
      serializeBigInt(detalles)
    );

  } catch (error) {
    console.error("ERROR GET /api/detalle-ventas:", error);

    return NextResponse.json(
      {
        error: "Error al obtener detalles de venta",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}