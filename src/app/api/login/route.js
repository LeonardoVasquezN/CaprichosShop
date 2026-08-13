import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { serializeBigInt } from "@/lib/serialize";

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
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoHasta.getTime() - Date.now()) / 60000
      );

      return NextResponse.json(
        {
          message: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${minutosRestantes} minuto(s).`,
        },
        { status: 429 }
      );
    }

    const coincide = await bcrypt.compare(clave, usuario.clave);

    if (!coincide) {
      const nuevosIntentos = usuario.intentosFallidos + 1;

      if (nuevosIntentos >= 5) {
        const bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.Usuario.update({
          where: {
            id: usuario.id,
          },
          data: {
            intentosFallidos: nuevosIntentos,
            bloqueadoHasta,
          },
        });

        return NextResponse.json(
          {
            message:
              "Demasiados intentos fallidos. La cuenta ha sido bloqueada durante 15 minutos.",
          },
          { status: 429 }
        );
      }

      await prisma.Usuario.update({
        where: {
          id: usuario.id,
        },
        data: {
          intentosFallidos: nuevosIntentos,
        },
      });

      return NextResponse.json(
        {
          message: `Credenciales inválidas. Intento ${nuevosIntentos} de 5.`,
        },
        { status: 401 }
      );
    }

    const { clave: _, ...usuarioSeguro } = usuario;
    
    await prisma.Usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }

    const token = jwt.sign(
      {
        id: Number(usuario.id),
        nombre: usuario.nombre,
        cargo: usuario.cargo,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    const response = NextResponse.json(
      {
        message: "Login Exitoso",
        usuario: serializeBigInt(usuarioSeguro),
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