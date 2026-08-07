import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const variantes = await prisma.variante.findMany({
    include: {
      producto: {
        include: {
          marca: true,
          subCategoria: {
            include: { categoria: true },
          },
        },
      },
      talla: true,
      color: true,
    },
  });

  return NextResponse.json(variantes);
}

export async function POST(req) {
  const body = await req.json();
  const { id_producto, id_color, id_talla, stock } = body;

  if (
    !id_producto ||
    !id_color ||
    !id_talla ||
    stock === undefined
  ) {
    return NextResponse.json(
      { mensaje: "Datos incompletos" },
      { status: 422 }
    );
  }

  const varianteExistente = await prisma.variante.findFirst({
    where: {
      productoId: Number(id_producto),
      colorId: Number(id_color),
      tallaId: Number(id_talla),
    },
  });

  if (varianteExistente) {
    if (varianteExistente.stock === stock) {
      return NextResponse.json(
        {
          mensaje:
            "Ya existe una variante con los mismos datos y el mismo stock.",
        },
        { status: 409 }
      );
    }

    const varianteActualizada = await prisma.variante.update({
      where: { id: varianteExistente.id },
      data: {
        stock: varianteExistente.stock + stock,
      },
    });

    await actualizarStockProducto(id_producto);

    return NextResponse.json({
      mensaje: "Variante existente. Stock actualizado.",
      variante_actualizada: varianteActualizada,
    });
  }

  const nuevaVariante = await prisma.variante.create({
    data: {
      productoId: Number(id_producto),
      colorId: Number(id_color),
      tallaId: Number(id_talla),
      stock: Number(stock),
    },
  });

  await actualizarStockProducto(id_producto);

  return NextResponse.json(
    {
      mensaje: "Variante nueva guardada con éxito.",
      existencias: nuevaVariante,
    },
    { status: 201 }
  );
}

async function actualizarStockProducto(productoId) {
  const total = await prisma.variante.aggregate({
    where: { productoId: Number(productoId) },
    _sum: { stock: true },
  });

  await prisma.producto.update({
    where: { id: Number(productoId) },
    data: {
      stockTotal: total._sum.stock || 0,
    },
  });
}