import express from "express"
import cors from "cors"
import printer from "node-thermal-printer"

const app = express()
app.use(cors())
app.use(express.json())

app.post("/print", async (req, res) => {
  const data = req.body

  try {
    await imprimir(data)
    res.json({ ok: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false })
  }
})

app.listen(3001, () => {
  console.log("🖨️ Print service corriendo en puerto 3001")
})




async function imprimir(data) {
  printer.init({
    type: "epson",
    interface: "usb"
  })

  printer.alignCenter()
  printer.println("CAPRICHOS SHOP")

  printer.alignLeft()
  printer.println("------------------------")

  printer.println(`Cliente: ${data.cliente}`)
  printer.println(`Comprobante: ${data.tipoComprobante}`)

  data.productos.forEach(p => {
    printer.println(`${p.nombre} x${p.cantidad}  S/ ${p.precio * p.cantidad}`)
  })

  printer.println("------------------------")
  printer.println(`TOTAL: S/ ${data.total}`)

  printer.cut()

  await printer.execute()
}