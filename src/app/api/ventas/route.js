import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function POST(req) {
//   try {
//     const {
//       fecha,
//       total,
//       metodo_de_pago,
//       id_cliente,
//       detalles,
//       preVentaId,
//     } = await req.json();

//     if (
//       !fecha ||
//       total === undefined ||
//       !metodo_de_pago ||
//       !id_cliente ||
//       !Array.isArray(detalles) ||
//       detalles.length === 0
//     ) {
//       return NextResponse.json(
//         { error: "Datos incompletos" },
//         { status: 422 }
//       );
//     }

//     const venta = await prisma.venta.create({
//       data: {
//         fecha: new Date(fecha),
//         total,
//         metodoDePago: metodo_de_pago,
//         clienteId: Number(id_cliente),
//       },
//     });

//     const operaciones = [];
//     const productosAActualizar = new Set();

//     for (const d of detalles) {

//       const productoId = Number(d.productoId);
//       const cantidad = Number(d.cantidad);

//       let variante;

//       if (d.varianteId) {

//         variante = await prisma.variante.findUnique({
//           where: {
//             id: Number(d.varianteId),
//           },
//         });

//       } 

//       else {

//         variante = await prisma.variante.findFirst({
//           where: {
//             productoId,
//             colorId: Number(d.colorId),
//             tallaId: Number(d.tallaId),
//           },
//         });

//       }

//       if (!variante) {
//         throw new Error(
//           `Variante no encontrada para producto ${productoId}`
//         );
//       }

//       if (variante.stock < cantidad) {
//         throw new Error(
//           `Stock insuficiente. Disponible: ${variante.stock}, solicitado: ${cantidad}`
//         );
//       }

//       operaciones.push(
//         prisma.variante.update({
//           where: {
//             id: variante.id,
//           },
//           data: {
//             stock: {
//               decrement: cantidad,
//             },
//           },
//         })
//       );

//       operaciones.push(
//         prisma.detalleVenta.create({
//           data: {
//             ventaId: venta.id,
//             productoId,
//             varianteId: variante.id,
//             cantidad,
//             precioUnitario: Number(d.precioUnitario),
//             total: Number(
//               d.subTotal ?? d.total
//             ),
//           },
//         })
//       );

//       productosAActualizar.add(productoId);
//     }

//     for (const productoId of productosAActualizar) {

//       const totalStock = await prisma.variante.aggregate({
//         where:{
//           productoId,
//         },
//         _sum:{
//           stock:true,
//         },
//       });

//       operaciones.push(
//         prisma.producto.update({
//           where:{
//             id:productoId,
//           },
//           data:{
//             stockTotal:
//               totalStock._sum.stock || 0,
//           },
//         })
//       );
//     }

//     await prisma.$transaction(operaciones);

//     if(preVentaId){
//       await prisma.detallePreVenta.deleteMany({
//         where:{
//           preVentaId:Number(preVentaId),
//         },
//       });

//       await prisma.preVenta.delete({
//         where:{
//           id:Number(preVentaId),
//         },
//       });
//     }

//     return NextResponse.json(
//       {
//         message:
//           "Venta registrada correctamente y stock actualizado",
//         ventaId: venta.id,
//       },
//       {
//         status:201,
//       }
//     );


//   } catch(error){
//     console.error(error);

//     return NextResponse.json(
//       {
//         error:"Error al registrar la venta",
//         detail:error.message,
//       },
//       {
//         status:500,
//       }
//     );
//   }
// }

export async function POST(req) {
  try {
    const {
      fecha,
      total,
      metodo_de_pago,
      id_cliente,
      detalles,
      preVentaId,
    } = await req.json();

    if (
      !fecha ||
      total === undefined ||
      !metodo_de_pago ||
      !id_cliente ||
      !Array.isArray(detalles) ||
      detalles.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 422 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {

      // 1. Crear la venta
      const venta = await tx.venta.create({
        data: {
          fecha: new Date(fecha),
          total: Number(total),
          metodoDePago: metodo_de_pago,
          clienteId: Number(id_cliente),
        },
      });

      // Guardamos los productos que necesitan
      // actualizar su stockTotal
      const productosAActualizar = new Set();

      // 2. Procesar cada detalle
      for (const d of detalles) {

        const productoId = Number(d.productoId);
        const cantidad = Number(d.cantidad);

        let variante;

        // Buscar por varianteId
        if (d.varianteId) {

          variante = await tx.variante.findUnique({
            where: {
              id: Number(d.varianteId),
            },
          });

        }

        // Buscar por producto + color + talla
        else {

          variante = await tx.variante.findFirst({
            where: {
              productoId,
              colorId: Number(d.colorId),
              tallaId: Number(d.tallaId),
            },
          });

        }

        if (!variante) {
          throw new Error(
            `Variante no encontrada para producto ${productoId}`
          );
        }

        // 3. Validar stock
        if (variante.stock < cantidad) {
          throw new Error(
            `Stock insuficiente. Disponible: ${variante.stock}, solicitado: ${cantidad}`
          );
        }

        // 4. Descontar stock de la variante
        await tx.variante.update({
          where: {
            id: variante.id,
          },
          data: {
            stock: {
              decrement: cantidad,
            },
          },
        });

        // 5. Crear detalle de venta
        await tx.detalleVenta.create({
          data: {
            ventaId: venta.id,
            productoId,
            varianteId: variante.id,
            cantidad,
            precioUnitario: Number(d.precioUnitario),
            total: Number(
              d.subTotal ?? d.total
            ),
          },
        });

        productosAActualizar.add(productoId);
      }

      // 6. ACTUALIZAR stockTotal de cada producto
      //
      // IMPORTANTE:
      // Esto ocurre DESPUÉS de descontar las variantes.
      //
      for (const productoId of productosAActualizar) {

        const totalStock = await tx.variante.aggregate({
          where: {
            productoId,
          },
          _sum: {
            stock: true,
          },
        });

        await tx.producto.update({
          where: {
            id: productoId,
          },
          data: {
            stockTotal: totalStock._sum.stock ?? 0,
          },
        });
      }

      return venta;
    });

    // 7. Si venía de una preventa, eliminarla
    if (preVentaId) {

      await prisma.detallePreVenta.deleteMany({
        where: {
          preVentaId: Number(preVentaId),
        },
      });

      await prisma.preVenta.delete({
        where: {
          id: Number(preVentaId),
        },
      });
    }

    return NextResponse.json(
      {
        message: "Venta registrada correctamente y stock actualizado",
        ventaId: resultado.id,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error("ERROR POST VENTA:", error);

    return NextResponse.json(
      {
        error: "Error al registrar la venta",
        detail: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(){
  try{
    const ventas = await prisma.venta.findMany({

      orderBy:{
        id:"desc",
      },

      include:{
        cliente:true,
        detalleVentas:{
          include:{
            producto:true,
            variante:{
              include:{
                color:true,
                talla:true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(ventas);
  }catch(error){
    console.error(
      "ERROR GET VENTAS:",
      error
    );
    return NextResponse.json(
      {
        error:"Error al obtener ventas",
        detail:error.message,
      },
      {
        status:500,
      }
    );
  }
}