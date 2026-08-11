import { NextResponse } from "next/server";

export async function POST() {
  try {
    const token = process.env.LUCODE_API_TOKEN;
    const url = process.env.LUCODE_API_URL;

    if (!token) {
      return NextResponse.json(
        {
          error: "LUCODE_API_TOKEN no está configurado"
        },
        {
          status: 500
        }
      );
    }

    if (!url) {
      return NextResponse.json(
        {
          error: "LUCODE_API_URL no está configurado"
        },
        {
          status: 500
        }
      );
    }

    const comprobante = {
      documento: "boleta",
      serie: "B001",
      numero: 1,
      fecha_de_emision: new Date()
        .toISOString()
        .split("T")[0],

      moneda: "PEN",

      tipo_operacion: "0101",

      cliente_tipo_de_documento: "1",
      cliente_numero_de_documento: "99999999",
      cliente_denominacion: "CLIENTE DE PRUEBA",
      cliente_direccion: "-",

      items: [
        {
          unidad_de_medida: "NIU",
          descripcion: "PRODUCTO DE PRUEBA",
          cantidad: "1",
          valor_unitario: "100.000000",
          porcentaje_igv: "18",
          codigo_tipo_afectacion_igv: "10",
          nombre_tributo: "IGV"
        }
      ],

      total: "118.00"
    };

    console.log("ENVIANDO A LUCODE:");
    console.log(comprobante);

    const respuesta = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },

      body: JSON.stringify(comprobante)
    });

    const data = await respuesta.json();

    console.log("RESPUESTA LUCODE:");
    console.log(data);

    return NextResponse.json(
      {
        httpStatus: respuesta.status,
        data
      },
      {
        status: respuesta.ok ? 200 : respuesta.status
      }
    );

  } catch (error) {

    console.error("ERROR LUCODE TEST:", error);

    return NextResponse.json(
      {
        error: "Error conectando con LuCode",
        detail: error.message
      },
      {
        status: 500
      }
    );
  }
}