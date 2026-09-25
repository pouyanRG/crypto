"use client";

import { useMemo, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import { calcPortfolioSummary } from "../../lib/portfolio";
import { formatPercent, formatPrice, formatUsd } from "../../lib/formatters";
import { MARKET_COIN_IDS } from "../../lib/coinAssets";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";

function PnLValue({ value, asPercent = false }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-[var(--color-text-muted)]">—</span>;
  }
  const tone =
    value > 0 ? "text-[var(--color-up)]" : value < 0 ? "text-[var(--color-down)]" : "text-[var(--color-text-muted)]";
  return <span className={`font-tabular ${tone}`}>{asPercent ? formatPercent(value) : formatUsd(value)}</span>;
}

export default function PortfolioClient() {
  const portfolio = useAppStore((state) => state.portfolio);
  const addPortfolioAsset = useAppStore((state) => state.addPortfolioAsset);
  const removePortfolioAsset = useAppStore((state) => state.removePortfolioAsset);

  const [coinId, setCoinId] = useState("");
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [formError, setFormError] = useState("");

  const portfolioIds = useMemo(() => portfolio.map((asset) => asset.id), [portfolio]);
  const selectIds = useMemo(
    () => [...new Set([...MARKET_COIN_IDS, ...portfolioIds])],
    [portfolioIds],
  );

  const {
    data: marketCoins,
    isLoading: marketsLoading,
    isError: marketsError,
    refetch,
  } = useCoinsMarket({
    ids: selectIds,
    perPage: Math.max(selectIds.length, 1),
    enabled: selectIds.length > 0,
  });

  const {
    data: portfolioMarket,
    isLoading: portfolioPricesLoading,
    isError: portfolioPricesError,
    refetch: refetchPortfolioPrices,
  } = useCoinsMarket({
    ids: portfolioIds,
    perPage: Math.max(portfolioIds.length, 1),
    enabled: portfolioIds.length > 0,
  });

  const coinOptions = useMemo(() => {
    const byId = new Map((marketCoins ?? []).map((coin) => [coin.id, coin]));
    return selectIds.map((id) => {
      const coin = byId.get(id);
      return {
        id,
        label: coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : id,
        currentPrice: coin?.current_price ?? null,
      };
    });
  }, [marketCoins, selectIds]);

  const pricesById = useMemo(() => {
    const map = {};
    for (const coin of portfolioMarket ?? []) {
      map[coin.id] = coin.current_price;
    }
    return map;
  }, [portfolioMarket]);

  const nameById = useMemo(() => {
    const map = {};
    for (const coin of portfolioMarket ?? marketCoins ?? []) {
      map[coin.id] = coin.name;
    }
    return map;
  }, [portfolioMarket, marketCoins]);

  const summary = useMemo(
    () => calcPortfolioSummary(portfolio, pricesById),
    [portfolio, pricesById],
  );

  const handleCoinChange = (event) => {
    const nextId = event.target.value;
    setCoinId(nextId);
    const option = coinOptions.find((item) => item.id === nextId);
    if (option?.currentPrice != null && buyPrice === "") {
      setBuyPrice(String(option.currentPrice));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const parsedAmount = Number(amount);
    const parsedBuyPrice = Number(buyPrice);

    if (!coinId) {
      setFormError("Select a coin.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }
    if (!Number.isFinite(parsedBuyPrice) || parsedBuyPrice < 0) {
      setFormError("Buy price must be zero or a positive number.");
      return;
    }

    addPortfolioAsset({
      id: coinId,
      amount: parsedAmount,
      buyPrice: parsedBuyPrice,
      purchasedAt: new Date().toISOString(),
    });

    setCoinId("");
    setAmount("");
    setBuyPrice("");
  };

  const handleRemove = (id, name) => {
    const label = name || id;
    if (typeof window !== "undefined" && !window.confirm(`Remove ${label} from your portfolio?`)) {
      return;
    }
    removePortfolioAsset(id);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Portfolio</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Stored locally in this browser. P/L uses live market prices (no fees).
          </p>
        </div>
        {portfolioIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPortfolioPrices()}
            loading={portfolioPricesLoading}
          >
            Refresh prices
          </Button>
        )}
      </div>

      <Card as="form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          id="portfolio-coin"
          label="Coin"
          required
          placeholder="Select a coin"
          value={coinId}
          onChange={handleCoinChange}
          disabled={marketsLoading}
        >
          {coinOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          id="portfolio-amount"
          label="Amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          required
          placeholder="e.g. 0.5"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <Input
          id="portfolio-buy-price"
          label="Buy price (USD)"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          required
          placeholder="e.g. 42000"
          value={buyPrice}
          onChange={(event) => setBuyPrice(event.target.value)}
          helperText="Average purchase price per coin"
        />

        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Add asset
          </Button>
        </div>

        {formError && (
          <p className="sm:col-span-2 lg:col-span-4 text-sm text-[var(--color-down)]" role="alert">
            {formError}
          </p>
        )}
        {marketsError && (
          <p className="sm:col-span-2 lg:col-span-4 text-sm text-[var(--color-text-secondary)]">
            Coin list could not refresh.{" "}
            <button type="button" className="text-[var(--color-accent)] underline" onClick={() => refetch()}>
              Retry
            </button>
          </p>
        )}
      </Card>

      {portfolio.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Add a coin, amount, and buy price to start tracking local P/L."
        />
      ) : portfolioPricesError ? (
        <ErrorState
          title="Prices unavailable"
          description="Your holdings are saved, but live prices could not be loaded."
          onRetry={refetchPortfolioPrices}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card as="div" variant="compact">
              <p className="text-xs text-[var(--color-text-muted)]">Total invested</p>
              <p className="mt-2 font-tabular text-lg font-semibold text-[var(--color-text-primary)]">
                {formatUsd(summary.totalCost)}
              </p>
            </Card>
            <Card as="div" variant="compact">
              <p className="text-xs text-[var(--color-text-muted)]">Current value</p>
              <p className="mt-2 font-tabular text-lg font-semibold text-[var(--color-text-primary)]">
                {summary.totalValue == null ? "—" : formatUsd(summary.totalValue)}
              </p>
            </Card>
            <Card as="div" variant="compact">
              <p className="text-xs text-[var(--color-text-muted)]">P/L ($)</p>
              <p className="mt-2 text-lg font-semibold">
                <PnLValue value={summary.absolutePnL} />
              </p>
            </Card>
            <Card as="div" variant="compact">
              <p className="text-xs text-[var(--color-text-muted)]">P/L (%)</p>
              <p className="mt-2 text-lg font-semibold">
                <PnLValue value={summary.percentPnL} asPercent />
              </p>
            </Card>
          </div>

          <Card as="div" variant="outlined" className="overflow-x-auto p-0">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Portfolio holdings and profit/loss</caption>
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Buy price</th>
                  <th className="px-4 py-3 font-medium text-right">Current</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-right">P/L</th>
                  <th className="px-4 py-3 font-medium text-right">%</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.positions.map((position) => (
                  <tr key={position.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {nameById[position.id] ?? position.id}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular">{position.amount}</td>
                    <td className="px-4 py-3 text-right font-tabular">{formatPrice(position.buyPrice)}</td>
                    <td className="px-4 py-3 text-right font-tabular">{formatPrice(position.currentPrice)}</td>
                    <td className="px-4 py-3 text-right font-tabular">
                      {position.currentValue == null ? "—" : formatUsd(position.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PnLValue value={position.absolutePnL} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PnLValue value={position.percentPnL} asPercent />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(position.id, nameById[position.id])}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </section>
  );
}
