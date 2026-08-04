import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, clave } = body;

    if (
      !nombre ||
      typeof nombre !== "string" ||
      !clave ||
      typeof clave !== "string"
    ) {
      return NextResponse.json(
        { message: "nombre y clave son obligatorios" },
        { status: 422 }
      );
    }

    const usuario = await prisma.Usuario.findFirst({
      where: {
        nombre: nombre
        // estado: 1,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (clave !== usuario.clave) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const { clave: _, ...usuarioSeguro } = usuario;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    )

    const response = NextResponse.json(
      {
        message: "Login Exitoso",
        usuario: usuarioSeguro,
      },
      {
        status: 200,
      }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error(" LOGIN ERROR COMPLETO ");
  console.error(error);
  console.error("message:", error?.message);
  console.error("stack:", error?.stack);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}