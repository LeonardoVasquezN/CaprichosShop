export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export async function GET(req) {
  try {
    const id = Number(req.nextUrl.pathname.split("/").pop());

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        subCategoria: { include: { categoria: true } },
        marca: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { mensaje: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error("GET PRODUCTO ERROR:", error);
    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const id = Number(req.nextUrl.pathname.split("/").pop());

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const data = {
      nombre: formData.get("nombre"),
      precioCompra: Number(formData.get("precio_compra")),
      precioVenta: Number(formData.get("precio_venta")),
      subCategoriaId: Number(formData.get("id_sub_categorias")),
      marcaId: formData.get("id_marca")
        ? Number(formData.get("id_marca"))
        : null,
    };

    const imagen = formData.get("imagen");

    if (imagen && typeof imagen === "object") {
      const buffer = Buffer.from(await imagen.arrayBuffer());

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "productos" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      data.imagen = upload.secure_url;
    }

    const producto = await prisma.producto.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      mensaje: "Producto actualizado correctamente",
      producto,
    });
  } catch (error) {
    console.error("PUT PRODUCTO ERROR:", error);
    return NextResponse.json(
      { mensaje: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const id = Number(req.nextUrl.pathname.split("/").pop());

    await prisma.producto.update({
      where: { id },
      data: { estado: false },
    });

    return NextResponse.json({
      mensaje: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("DELETE PRODUCTO ERROR:", error);
    return NextResponse.json(
      { mensaje: "Error interno" },
      { status: 500 }
    );
  }
}