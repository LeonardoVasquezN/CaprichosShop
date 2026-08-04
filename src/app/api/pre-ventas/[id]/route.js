import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(_req, context) {
  try {

    const usuario = await verificarSesion();

    if (!usuario) {
      return NextResponse.json(
        { mensaje: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const preVentaId = Number(id);

    if (isNaN(preVentaId)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.detallePreVenta.deleteMany({
        where: { preVentaId },
      }),

      prisma.preVenta.delete({
        where: { id: preVentaId },
      }),
    ]);

    return NextResponse.json({
      mensaje: "Pre-venta eliminada correctamente",
    });
  } catch (error) {
    console.error("DELETE /api/pre-ventas/[id] error:", error);

    return NextResponse.json(
      { mensaje: "Error al eliminar pre-venta" },
      { status: 500 }
    );
  }
}