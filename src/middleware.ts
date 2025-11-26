import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Rotas públicas
  const publicRoutes = ["/auth/v2/login", "/auth/v2/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Se está tentando acessar dashboard sem sessão, redireciona para login
  if (pathname.startsWith("/dashboard") && !sessionToken) {
    return NextResponse.redirect(new URL("/auth/v2/login", request.url));
  }

  // Se está logado e tentando acessar login/register, redireciona para dashboard
  if (isPublicRoute && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard/finance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

