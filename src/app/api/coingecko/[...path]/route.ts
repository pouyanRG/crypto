const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;

  if (path.length === 0 || path.some((segment) => !segment || segment.includes(".."))) {
    return Response.json({ error: "Invalid CoinGecko path" }, { status: 400 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = `${COINGECKO_API_URL}/${path.map(encodeURIComponent).join("/")}${incomingUrl.search}`;
  const headers = new Headers({ Accept: "application/json" });
  const apiKey = process.env.COINGECKO_API_KEY;

  if (apiKey) {
    headers.set("x-cg-demo-api-key", apiKey);
  }

  try {
    const response = await fetch(upstreamUrl, { headers, cache: "no-store" });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "CoinGecko is temporarily unavailable" }, { status: 502 });
  }
}