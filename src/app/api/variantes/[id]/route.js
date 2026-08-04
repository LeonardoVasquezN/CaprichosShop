import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";

export async function GET(_req, { params }) {
  const id = Number(params.id);

  const variante = await prisma.variante.findUnique({
    where: { id },
    include: {
      producto: {
        include: {
          subCategoria: {
            include: { categoria: true },
          },
        },
      },
      talla: true,
      color: true,
    },
  });

  return NextResponse.json(variante);
}

export async function PUT(req, { params }) {

  const usuario = await verificarAdmin();

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "No autorizado" },
      { status: 403 }
    );
  }

  const id = Number(params.id);

  const {
    id_color,
    id_talla,
    stock
  } = await req.json();


  const variante = await prisma.variante.update({

    where: {
      id
    },

    data: {
      colorId: Number(id_color),
      tallaId: Number(id_talla),
      stock: Number(stock)
    }
  });

  await actualizarStockProducto(variante.productoId);

  return NextResponse.json({
    mensaje: "Variante actualizada correctamente",
    variante
  });
}

export async function DELETE(_req, { params }) {

  const usuario = await verificarAdmin();

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "No autorizado" },
      { status: 403 }
    );
  }

  const id = Number(params.id);

  const variante = await prisma.variante.findUnique({
    where: { id },
  });

  await prisma.variante.delete({ where: { id } });
  await actualizarStockProducto(variante.productoId);

  return NextResponse.json({
    mensaje: "Variante eliminada correctamente",
  });
}

async function actualizarStockProducto(productoId) {
  const total = await prisma.variante.aggregate({
    where: { productoId },
    _sum: { stock: true },
  });

  await prisma.producto.update({
    where: { id: productoId },
    data: { stockTotal: total._sum.stock || 0 },
  });
}