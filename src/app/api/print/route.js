import { NextResponse } from "next/server";
import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";

const CHARS = 32; // Para impresora 58mm normalmente son 32 caracteres

function money(value) {
  return Number(value || 0).toFixed(2);
}

function centerText(text) {
  text = String(text || "");
  const spaces = Math.max(0, Math.floor((CHARS - text.length) / 2));
  return " ".repeat(spaces) + text;
}

function line(char = "-") {
  return char.repeat(CHARS);
}

function leftRight(left, right) {
  left = String(left || "");
  right = String(right || "");

  const spaces = CHARS - left.length - right.length;

  if (spaces <= 0) {
    return left.substring(0, CHARS - right.length - 1) + " " + right;
  }

  return left + " ".repeat(spaces) + right;
}

function row4(cant, punit, und, total) {
  const c1 = String(cant).padStart(4, " ");
  const c2 = String(punit).padStart(7, " ");
  const c3 = String(und).padStart(6, " ");
  const c4 = String(total).padStart(9, " ");

  return `${c1}${c2}${c3}${c4}`;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      cliente = "CLIENTE GENÉRICO",
      productos = [],
      total = 0,
      tipoComprobante = "NV",
    } = body;

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: "bluetooth://00:11:22:33:44:55",
      characterSet: "SLOVENIA",
      removeSpecialCharacters: false,
      lineCharacter: "-",
    });

    const fecha = new Date();
    const fechaTexto = fecha.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const numeroNota = "NV01-00000094";

    printer.alignCenter();

    // QR opcional
    // Si tu impresora no soporta QR, comenta esta línea.
    printer.printQR(numeroNota);

    printer.println("");
    printer.println(line("-"));
    printer.println("NOTA DE VENTA");
    printer.println(line("-"));

    printer.println("10181328894");
    printer.println("CAPRICHO'S SHOP");
    printer.println(line("-"));
    printer.println("TRUJILLO");
    printer.println(line("-"));
    printer.println(fechaTexto);
    printer.println(numeroNota);
    printer.println(line("-"));

    printer.println(String(cliente || "CLIENTE GENÉRICO").toUpperCase());
    printer.println("00256569");
    printer.println(line("="));

    printer.alignLeft();

    printer.println("Cant  P.Und   Und    P.Total");
    printer.println(line("="));

    productos.forEach((p) => {
      const nombre = String(p.nombre || "").toUpperCase();
      const cantidad = Number(p.cantidad || 0);
      const precio = Number(p.precio || 0);
      const subtotal = cantidad * precio;

      printer.println(nombre);

      printer.println(
        row4(
          cantidad,
          money(precio),
          "NIU",
          money(subtotal)
        )
      );
    });

    printer.println(line("-"));

    printer.println(leftRight("Descuento Gral.", `S/ ${money(0)}`));
    printer.println("");

    printer.println(leftRight("Total", `S/ ${money(total)}`));
    printer.println(leftRight("Pago", `S/ ${money(total)}`));

    printer.println(line("-"));

    printer.alignRight();
    printer.println("CONTADO");

    printer.alignCenter();
    printer.println(line("-"));
    printer.println("Atendido por:");
    printer.println("Shop");
    printer.println(line("-"));
    printer.println("SOLICITE SU COMPROBANTE EN CAJA");

    printer.println("");
    printer.println("");
    printer.cut();

    await printer.execute();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}