import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/Dashboard/:path*",
    "/MantProductos/:path*",
    "/MantUsuarios/:path*",
    "/MantCategorias/:path*",
    "/MantMarcas/:path*",
    "/MantColores/:path*",
    "/MantTallas/:path*",
    "/Ventas/:path*",
    "/Compras/:path*",
  ],
};