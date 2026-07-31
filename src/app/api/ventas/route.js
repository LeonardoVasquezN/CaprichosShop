import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const {
      fecha,
      total,
      metodo_de_pago,
      id_cliente,
      detalles,
      preVentaId,
    } = await req.json();

    if (
      !fecha ||
      total === undefined ||
      !metodo_de_pago ||
      !id_cliente ||
      !preVentaId ||
      !Array.isArray(detalles) ||
      detalles.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 422 }
      );
    }

    const venta = await prisma.venta.create({
      data: {
        fecha: new Date(fecha),
        total,
        metodoDePago: metodo_de_pago,
        clienteId: Number(id_cliente),
      },
    });

    const operaciones = [];
    const productosAActualizar = new Set();

    for (const d of detalles) {
      const productoId = Number(d.productoId);
      const colorId = Number(d.colorId);
      const tallaId = Number(d.tallaId);
      const cantidad = Number(d.cantidad);

      const variante = await prisma.variante.findFirst({
        where: { productoId, colorId, tallaId },
      });

      if (!variante) {
        throw new Error(
          `Variante no encontrada (producto ${productoId}, color ${colorId}, talla ${tallaId})`
        );
      }

      if (variante.stock < cantidad) {
        throw new Error(
          `Stock insuficiente para producto ${productoId}. Stock: ${variante.stock}, solicitado: ${cantidad}`
        );
      }

      operaciones.push(
        prisma.variante.update({
          where: { id: variante.id },
          data: { stock: { decrement: cantidad } },
        })
      );

      operaciones.push(
        prisma.detalleVenta.create({
          data: {
            ventaId: venta.id,
            productoId,
            varianteId: variante.id,
            cantidad,
            precioUnitario: d.precioUnitario,
            total: d.subTotal,
          },
        })
      );

      productosAActualizar.add(productoId);
    }

    for (const productoId of productosAActualizar) {
      const totalStock = await prisma.variante.aggregate({
        where: { productoId },
        _sum: { stock: true },
      });

      operaciones.push(
        prisma.producto.update({
          where: { id: productoId },
          data: {
            stockTotal: totalStock._sum.stock || 0,
          },
        })
      );
    }

    await prisma.$transaction(operaciones);

    await prisma.detallePreVenta.deleteMany({
      where: { preVentaId: Number(preVentaId) },
    });

    await prisma.preVenta.delete({
      where: { id: Number(preVentaId) },
    });

    const preVenta = await prisma.preVenta.findUnique({
      where: {
        id: Number(preVentaId),
      },
    });

    console.log("Preventa encontrada:", preVenta);

    return NextResponse.json(
      { message: "Venta registrada correctamente y stock actualizado" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error.stack);

    return NextResponse.json(
      {
        error: "Error al registrar la venta",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      orderBy: { id: "desc" },
      include: {
        cliente: true,
        detalleVentas: {
          include: {
            producto: true,
            variante: {
              include: { color: true, talla: true },
            },
          },
        },
      },
    });

    return NextResponse.json(ventas);
  } catch (error) {
    console.error(" ERROR GET VENTAS:", error);

    return NextResponse.json(
      {
        error: "Error al obtener ventas",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}