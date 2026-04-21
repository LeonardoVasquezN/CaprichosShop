import { NextResponse } from "next/server";
import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";

export async function POST(req) {
  try {
    const body = await req.json();

    const { cliente, productos, total } = body;

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: "bluetooth://00:11:22:33:44:55" // Poner el ip que usara la laptop y la impresora
    });

    printer.alignCenter();
    printer.println("NOTA DE VENTA");
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Cliente: ${cliente || "GENÉRICO"}`);
    printer.println("");

    productos.forEach(p => {
      printer.println(`${p.nombre} x${p.cantidad}   S/ ${p.precio * p.cantidad}`);
    });

    printer.drawLine();
    printer.bold(true);
    printer.println(`TOTAL: S/ ${total}`);
    printer.bold(false);

    printer.cut();

    await printer.execute();

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message });
  }
}