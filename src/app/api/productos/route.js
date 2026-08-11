export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { serializeBigInt } from "@/lib/serialize";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        subCategoria: {
          include: {
            categoria: true,
          },
        },
        marca: true,
      },
    });

    return NextResponse.json(serializeBigInt(productos));
  } catch (error) {
    console.error("GET PRODUCTOS ERROR:", error);

    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const nombre = formData.get("nombre");

    const subCategoriaId = formData.get("id_sub_categorias")
      ? BigInt(formData.get("id_sub_categorias"))
      : null;

    const precioCompra = Number(formData.get("precio_compra"));
    const precioVenta = Number(formData.get("precio_venta"));

    if (!nombre || subCategoriaId === null) {
      return NextResponse.json(
        { mensaje: "Datos inválidos" },
        { status: 400 }
      );
    }

    const nombreLimpio = nombre.trim();

    let imageUrl = null;
    const imagen = formData.get("imagen");

    if (imagen && typeof imagen === "object") {
      const buffer = Buffer.from(await imagen.arrayBuffer());

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "productos",
              transformation: [
                {
                  fetch_format: "auto",
                  quality: "auto",
                },
              ],
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      imageUrl = upload.secure_url;
    }

    const productoExistente = await prisma.producto.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
    });

    if (productoExistente) {
      return NextResponse.json(
        { mensaje: "Ya existe un producto con ese nombre" },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.create({
      data: {
        nombre: nombreLimpio,
        precioCompra,
        precioVenta,
        subCategoriaId,
        marcaId: formData.get("id_marca")
          ? BigInt(formData.get("id_marca"))
          : null,
        stockTotal: 0,
        imagen: imageUrl,
      },
    });

    return NextResponse.json(serializeBigInt(producto), {
      status: 201,
    });
  } catch (error) {
    console.error("ERROR POST PRODUCTO:", error);

    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}
