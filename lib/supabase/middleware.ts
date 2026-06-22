import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// /api/shortcut is authenticated by a personal bearer token inside the route
// handler, not by a session cookie, so the middleware must not redirect it to
// /login.
const PUBLIC_ROUTES = ["/login", "/signup", "/auth", "/api/shortcut"];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

// Pages a signed-in Operator has no reason to see; bounce them to the ledger.
// Excludes /auth and /api/shortcut, which must still run with a session.
const AUTH_PAGES = ["/login", "/signup"];

const isAuthPage = (pathname: string) =>
  AUTH_PAGES.some((route) => pathname.startsWith(route));

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie. Do not run logic between createServerClient
  // and getUser, per Supabase SSR docs, to avoid auth/session race conditions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/balance";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
