import { NextResponse } from "next/server";
import { jwtVerify } from "jose";


export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  console.log("TOKEN DEL MIDDLEWARE:", token);

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return NextResponse.next();

  } catch (error) {
    console.log("ERROR JWT:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/MantProductos/:path*",
    "/MantExistencia/:path*",
    "/MantUsuario/:path*",
    "/MantCategorias/:path*",
    "/MantSubCategorias/:path*",
    "/MantMarcas/:path*",
    "/MantColor/:path*",
    "/MantTalla/:path*",
    "/Ventas/:path*",
    "/PreVenta/:path*",
    "/post/:path*",
  ],
};