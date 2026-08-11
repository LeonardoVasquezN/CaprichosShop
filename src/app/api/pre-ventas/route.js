import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Convierte BigInt a Number para poder enviarlo como JSON
const serializeBigInt = (data) =>
  JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );

// POST: crear pre-venta
export async function POST(req) {
  try {
    const body = await req.json();

    const { productos, total, id_cliente } = body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: "Productos inválidos" },
        { status: 422 }
      );
    }

    if (!id_cliente || total === undefined || total === null) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 422 }
      );
    }

    for (const p of productos) {
      if (
        !p.producto_id ||
        !p.talla_id ||
        !p.color_id ||
        !p.cantidad ||
        p.precio_unitario === undefined ||
        p.precio_unitario === null
      ) {
        return NextResponse.json(
          {
            error:
              "Cada producto debe tener producto_id, talla_id, color_id, cantidad y precio_unitario",
          },
          { status: 422 }
        );
      }
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const preVenta = await tx.preVenta.create({
        data: {
          clienteId: Number(id_cliente),
          total: Number(total),
          estado: 0,
          fecha: new Date(),
        },
      });

      for (const producto of productos) {
        await tx.detallePreVenta.create({
          data: {
            preVentaId: preVenta.id,
            productoId: Number(producto.producto_id),
            tallaId: Number(producto.talla_id),
            colorId: Number(producto.color_id),
            cantidad: Number(producto.cantidad),
            precioUnitario: Number(producto.precio_unitario),
            subTotal: Number(producto.sub_total),
          },
        });
      }

      return preVenta;
    });

    return NextResponse.json(
      serializeBigInt({
        message: "Pre venta guardada correctamente",
        preVentaId: resultado.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR PRE-VENTA POST:", error);

    return NextResponse.json(
      {
        error: "Error al guardar la pre venta",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}

// GET: obtener pre-ventas
export async function GET() {
  try {
    const preVentas = await prisma.preVenta.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(serializeBigInt(preVentas));
  } catch (error) {
    console.error("ERROR GET PRE-VENTAS:", error);

    return NextResponse.json(
      {
        error: "Error al obtener pre-ventas",
        detalle: error.message,
      },
      { status: 500 }
    );
  }
}