import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      cargo: true,
    },
  });

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(usuario);
}

export async function PUT(req, { params }) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: body.nombre,
        cargo: body.cargo,
        clave: body.clave,
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}