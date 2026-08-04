import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin/unauthorized";
  const isAdminRoute = pathname.startsWith("/admin") && !isPublicAdminRoute;

  const { response, user, supabase } = await updateSession(request);

  if (!isAdminRoute) return response;

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the logged-in user is an approved, active administrator —
  // being authenticated with Supabase is not enough on its own.
  const { data: admin } = await supabase
    .from("administrators")
    .select("id, role, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!admin) {
    return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
