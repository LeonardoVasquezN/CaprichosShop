import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { serializeBigInt } from "@/lib/serialize";

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

  return NextResponse.json(serializeBigInt(usuario));
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

  if (isNaN(id)) {
    return NextResponse.json(
      { mensaje: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    let claveNueva = undefined;

    if (body.clave) {
      claveNueva = await bcrypt.hash(body.clave, 12);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: body.nombre,
        cargo: body.cargo,
        clave: claveNueva,
      },
    });

    return NextResponse.json(serializeBigInt(usuarioActualizado));
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}