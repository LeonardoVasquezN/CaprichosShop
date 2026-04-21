export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const productos = await prisma.producto.findMany({
    where: {
      estado: true,
      subCategoria: {
        estado: 1,
      }
    },
    include: {
      subCategoria: { include: { categoria: true } },
      marca: true,
    },
  });

  return NextResponse.json(productos);
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const nombre = formData.get("nombre");
    const subCategoriaId = Number(formData.get("id_sub_categorias"));
    const precioCompra = Number(formData.get("precio_compra"));
    const precioVenta = Number(formData.get("precio_venta"));

    if (!nombre || isNaN(subCategoriaId)) {
      return NextResponse.json(
        { mensaje: "Datos inválidos" },
        { status: 400 }
      );
    }

    let imageUrl = null;
    const imagen = formData.get("imagen");

    if (imagen && typeof imagen === "object") {
      const buffer = Buffer.from(await imagen.arrayBuffer());

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "productos" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = upload.secure_url;
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precioCompra,
        precioVenta,
        subCategoriaId,
        marcaId: formData.get("id_marca")
          ? Number(formData.get("id_marca"))
          : null,
        stockTotal: 0,
        imagen: imageUrl,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error("ERROR POST PRODUCTO:", error);
    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}