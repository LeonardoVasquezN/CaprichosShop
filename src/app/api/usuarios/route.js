import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        cargo: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(serializeBigInt(usuarios));
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, cargo, clave } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { mensaje: "El nombre es obligatorio" },
        { status: 422 }
      );
    }

    if (!cargo || typeof cargo !== "string") {
      return NextResponse.json(
        { mensaje: "El cargo es obligatorio" },
        { status: 422 }
      );
    }

    if (!clave || typeof clave !== "string") {
      return NextResponse.json(
        { mensaje: "La clave es obligatoria" },
        { status: 422 }
      );
    }

    const hashed = await bcrypt.hash(clave, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        cargo,
        clave: hashed,
      },
    });

    const { clave: _clave, ...userSafe } = usuario;

    return NextResponse.json(
      {
        mensaje: "usuario guardado con exito",
        usuarios: serializeBigInt(userSafe),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { mensaje: "Error al guardar usuario", details: error.message },
      { status: 500 }
    );
  }
}