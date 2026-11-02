const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;

  if (path.length === 0 || path.some((segment) => !segment || segment.includes(".."))) {
    return Response.json({ error: "Invalid market data request." }, { status: 400 });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = `${COINGECKO_API_URL}/${path.map(encodeURIComponent).join("/")}${incomingUrl.search}`;
  const headers = new Headers({ Accept: "application/json" });
  const apiKey = process.env.COINGECKO_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.error("Market data API key is not configured.");
    }
    return Response.json({ error: "Market data is currently unavailable. Please try again." }, { status: 500 });
  }

  headers.set("x-cg-demo-api-key", apiKey);

  try {
    const response = await fetch(upstreamUrl, { headers, next: { revalidate: 60 } });
    const body = await response.text();

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("Market data upstream request failed", response.status, body);
      }
      return Response.json(
        { error: "Unable to load market data. Please try again." },
        { status: response.status, headers: { "cache-control": "no-store" } },
      );
    }

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Market data request failed", error);
    }
    return Response.json({ error: "Unable to load market data. Please try again." }, { status: 502 });
  }
}