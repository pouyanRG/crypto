const API_BASE_URL = "https://api.coingecko.com/api/v3";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetcher(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(`CoinGecko request failed (${response.status})`, response.status);
  }
  return response.json();
}

export function getMarketsUrl({ page = 1, perPage = 50, ids = [] } = {}) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,7d",
  });
  if (ids.length > 0) params.set("ids", ids.join(","));
  return `${API_BASE_URL}/coins/markets?${params}`;
}

export function getCoinDetailUrl(id) {
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
}

export function getCoinChartUrl(id, days = 30) {
  const params = new URLSearchParams({ vs_currency: "usd", days: String(days), interval: days > 90 ? "daily" : "hourly" });
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}/market_chart?${params}`;
}

export function normalizeChartData(chart) {
  return (chart?.prices ?? []).map(([timestamp, price]) => ({ timestamp, price }));
}

export { API_BASE_URL };