export const MARKET_DATA_STALE_AFTER_MS = 5 * 60 * 1000;

export function getMarketDataFreshness(data, responseUpdatedAt) {
  if (Array.isArray(data) && data.length > 0) {
    const sourceTimestamps = data.map((coin) => {
      if (typeof coin?.last_updated !== "string") return null;
      const timestamp = Date.parse(coin.last_updated);
      return Number.isFinite(timestamp) ? timestamp : null;
    });

    if (sourceTimestamps.every((timestamp) => timestamp !== null)) {
      return { timestamp: Math.min(...sourceTimestamps), source: "provider" };
    }
  }

  return responseUpdatedAt ? { timestamp: responseUpdatedAt, source: "response" } : null;
}

export function isMarketDataStale(timestamp, now = Date.now()) {
  return !timestamp || now - timestamp > MARKET_DATA_STALE_AFTER_MS;
}
