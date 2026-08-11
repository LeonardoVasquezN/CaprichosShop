import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export async function POST(req, { params }) {
  const id = Number(params.id);
  const { cantidad } = await req.json();

  if (!id || !cantidad || cantidad <= 0) {
    return NextResponse.json(
      { message: "Datos inválidos" },
      { status: 400 }
    );
  }

  const variante = await prisma.variante.findUnique({
    where: { id },
  });

  if (!variante) {
    return NextResponse.json(
      { message: "Variante no encontrada" },
      { status: 404 }
    );
  }

  if (variante.stock < cantidad) {
    return NextResponse.json(
      { message: "Stock insuficiente" },
      { status: 409 }
    );
  }

  const varianteActualizada = await prisma.variante.update({
    where: { id },
    data: {
      stock: {
        decrement: Number(cantidad),
      },
    },
  });

  await actualizarStockProducto(variante.productoId);

  return NextResponse.json(
    serializeBigInt({
      message: "Stock actualizado correctamente",
      nuevo_stock: varianteActualizada.stock,
    })
  );
}

async function actualizarStockProducto(productoId) {
  const total = await prisma.variante.aggregate({
    where: { productoId },
    _sum: { stock: true },
  });

  await prisma.producto.update({
    where: { id: productoId },
    data: {
      stockTotal: total._sum.stock || 0,
    },
  });
}