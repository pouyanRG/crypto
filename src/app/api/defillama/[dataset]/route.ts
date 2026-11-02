const DATASETS = {
  protocols: "https://api.llama.fi/protocols",
  chains: "https://api.llama.fi/v2/chains",
} as const;

interface RouteContext {
  params: Promise<{ dataset: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { dataset } = await context.params;

  if (!Object.hasOwn(DATASETS, dataset)) {
    return Response.json({ error: "Unsupported DeFiLlama dataset" }, { status: 404 });
  }

  const upstreamUrl = DATASETS[dataset as keyof typeof DATASETS];

  try {
    const response = await fetch(upstreamUrl, { next: { revalidate: 300 } });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": response.ok
          ? "public, s-maxage=300, stale-while-revalidate=900"
          : "no-store",
      },
    });
  } catch {
    return Response.json({ error: "DeFiLlama is temporarily unavailable" }, { status: 502 });
  }
}
