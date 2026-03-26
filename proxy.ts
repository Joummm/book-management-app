import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function proxy(request: NextRequest) {
  // Obter o token do cookie
  const token = request.cookies.get("auth-token")?.value;
  
  let user = null;
  
  // Verificar token JWT
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      user = decoded;
    } catch (error) {
      // Token inválido - limpar cookie se necessário
      console.error("Token inválido:", error);
    }
  }
  
  const pathname = request.nextUrl.pathname;
  
  // Rotas protegidas (usuário não autenticado)
  const protectedPaths = [
    "/dashboard",
    "/books",
    "/add-book",
    "/edit-book",
    "/profile"
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Rotas de auth (usuário já autenticado)
  const authPaths = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/check-email"
  ];
  
  const isAuthPath = authPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // RAIZ - redirecionar baseado no status
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }
  
  // Se não está autenticado e tenta acessar rota protegida
  if (!user && isProtectedPath) {
    const url = new URL("/auth/login", request.url);
    // Preservar a URL original para redirecionar após login
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  
  // Se está autenticado e tenta acessar rota de auth (exceto logout)
  if (user && isAuthPath && pathname !== "/auth/logout") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};