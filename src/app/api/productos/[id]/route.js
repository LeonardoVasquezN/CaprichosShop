export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { verificarSesion } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const usuario = await verificarSesion();

    if (!usuario) {
      return NextResponse.json(
        {
          mensaje: "No autorizado",
        },
        {
          status: 401,
        }
      );
    }

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

    if (imagen instanceof File && imagen.size > 0) {

      const buffer = Buffer.from(
        await imagen.arrayBuffer()
      );

      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "productos",
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
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

export async function PATCH(req) {
  try {

    const usuario = await verificarSesion();

    if (!usuario) {
      return NextResponse.json(
        {
          mensaje: "No autorizado",
        },
        {
          status: 401,
        }
      );
    }

    const id = Number(req.nextUrl.pathname.split("/").pop());

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { mensaje: "ID inválido" },
        { status: 400 }
      );
    }

    const { estado } = await req.json();

    const producto = await prisma.producto.update({
      where:{
        id
      },
      data:{
        estado
      }
    });

    return NextResponse.json({
      mensaje:"Estado actualizado correctamente",
      producto
    });


  } catch(error){
    console.error("PATCH PRODUCTO ERROR:", error);

    return NextResponse.json(
      {
        mensaje:"Error interno"
      },
      {
        status:500
      }
    );
  }
}