import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const ventaId = Number(id);

    if (!Number.isInteger(ventaId)) {
      return NextResponse.json(
        {
          error: "ID de venta inválido",
        },
        {
          status: 400,
        }
      );
    }

    const venta = await prisma.venta.findUnique({
      where: {
        id: ventaId,
      },

      include: {
        cliente: true,

        detalleVentas: {
          include: {
            producto: true,

            variante: {
              include: {
                color: true,
                talla: true,
              },
            },
          },
        },
      },
    });

    if (!venta) {
      return NextResponse.json(
        {
          error: "Venta no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      serializeBigInt(venta)
    );

  } catch (error) {
    console.error("ERROR GET VENTA:", error);

    return NextResponse.json(
      {
        error: "Error al obtener la venta",
        detail: error.message,
      },
      {
        status: 500,
      }
    );
  }
}