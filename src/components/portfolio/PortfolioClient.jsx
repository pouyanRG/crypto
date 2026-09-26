"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import useCoinSearch from "../../lib/hooks/useCoinSearch";
import { useAppStore } from "../../lib/store/useAppStore";
import { calcPortfolioSummary } from "../../lib/portfolio";
import { formatPercent, formatPrice, formatUsd } from "../../lib/formatters";
import { MARKET_COIN_IDS } from "../../lib/coinAssets";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";

const TOP_COIN_IDS = MARKET_COIN_IDS.slice(0, 20);

function PnLValue({ value, asPercent = false }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-[var(--color-text-muted)]">—</span>;
  }
  const tone =
    value > 0 ? "text-[var(--color-up)]" : value < 0 ? "text-[var(--color-down)]" : "text-[var(--color-text-muted)]";
  return <span className={`font-tabular ${tone}`}>{asPercent ? formatPercent(value) : formatUsd(value)}</span>;
}

export default function PortfolioClient() {
  const router = useRouter();
  const portfolio = useAppStore((state) => state.portfolio);
  const addPortfolioAsset = useAppStore((state) => state.addPortfolioAsset);
  const removePortfolioAsset = useAppStore((state) => state.removePortfolioAsset);

  const [coinId, setCoinId] = useState("");
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [coinSearchTerm, setCoinSearchTerm] = useState("");
  const [debouncedCoinSearch, setDebouncedCoinSearch] = useState("");
  const [selectedCoinLabel, setSelectedCoinLabel] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedCoinSearch(coinSearchTerm), 250);
    return () => clearTimeout(timeout);
  }, [coinSearchTerm]);

  const { data: searchResults = [], isFetching: searchLoading } = useCoinSearch(debouncedCoinSearch);

  const portfolioIds = useMemo(() => portfolio.map((asset) => asset.id), [portfolio]);
  const selectIds = useMemo(
    () => [...new Set([...TOP_COIN_IDS, ...portfolioIds])],
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

  const handleCoinSelect = (id, currentPrice, label) => {
    setCoinId(id);
    setSelectedCoinLabel(label ?? coinOptions.find((option) => option.id === id)?.label ?? id);
    if (currentPrice != null && buyPrice === "") {
      setBuyPrice(String(currentPrice));
    }
    setCoinSearchTerm("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

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

    const alreadyHeld = portfolio.some((asset) => asset.id === coinId);
    addPortfolioAsset({
      id: coinId,
      amount: parsedAmount,
      buyPrice: parsedBuyPrice,
      purchasedAt: new Date().toISOString(),
    });
    setSuccessMessage(
      alreadyHeld
        ? "Added to your existing holding. The average buy price has been updated."
        : "Asset added to your portfolio.",
    );

    setCoinId("");
    setSelectedCoinLabel("");
    setAmount("");
    setBuyPrice("");
  };

  const estimatedCost = useMemo(() => {
    const parsedAmount = Number(amount);
    const parsedBuyPrice = Number(buyPrice);
    if (!Number.isFinite(parsedAmount) || !Number.isFinite(parsedBuyPrice) || parsedAmount <= 0 || parsedBuyPrice < 0) {
      return null;
    }
    return parsedAmount * parsedBuyPrice;
  }, [amount, buyPrice]);

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
        <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">افزودن دارایی جدید</h2>
        </div>

        <div className="sm:col-span-2 lg:col-span-4 grid gap-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Coin <span aria-hidden="true">*</span>
          </p>

          {marketsLoading ? (
            <p className="text-sm text-[var(--color-text-muted)]">در حال بارگذاری لیست کوین‌ها...</p>
          ) : (
            <div
              role="radiogroup"
              aria-label="کوین‌های برتر"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {coinOptions
                .filter((option) => TOP_COIN_IDS.includes(option.id))
                .map((option) => {
                  const selected = coinId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleCoinSelect(option.id, option.currentPrice, option.label)}
                      className={clsx(
                        "truncate rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
            </div>
          )}

          <Input
            id="portfolio-coin-search"
            label="جستجوی کوین‌های دیگر"
            placeholder="مثلاً dogecoin"
            value={coinSearchTerm}
            onChange={(event) => setCoinSearchTerm(event.target.value)}
            onClear={() => setCoinSearchTerm("")}
          />

          {debouncedCoinSearch.trim().length >= 2 && (
            <ul className="max-h-48 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              {searchLoading && (
                <li className="px-3 py-2 text-sm text-[var(--color-text-muted)]">در حال جستجو...</li>
              )}
              {!searchLoading && searchResults.length === 0 && (
                <li className="px-3 py-2 text-sm text-[var(--color-text-muted)]">نتیجه‌ای یافت نشد</li>
              )}
              {searchResults.map((coin) => (
                <li key={coin.id}>
                  <button
                    type="button"
                    onClick={() =>
                      handleCoinSelect(coin.id, null, `${coin.name} (${coin.symbol.toUpperCase()})`)
                    }
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)]"
                  >
                    <span>
                      {coin.name}{" "}
                      <span className="uppercase text-[var(--color-text-muted)]">{coin.symbol}</span>
                    </span>
                    {coin.rank && (
                      <span className="text-xs text-[var(--color-text-muted)]">#{coin.rank}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {coinId && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              انتخاب‌شده:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">{selectedCoinLabel}</span>
            </p>
          )}
        </div>

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

        <div className="flex flex-col justify-end gap-1.5">
          {estimatedCost != null && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              سرمایه‌گذاری تخمینی: <span className="font-tabular font-semibold text-[var(--color-text-primary)]">{formatUsd(estimatedCost)}</span>
            </p>
          )}
          <Button type="submit" className="w-full">
            Add asset
          </Button>
        </div>

        {formError && (
          <p className="sm:col-span-2 lg:col-span-4 text-sm text-[var(--color-down)]" role="alert">
            {formError}
          </p>
        )}
        {successMessage && (
          <p className="sm:col-span-2 lg:col-span-4 text-sm text-[var(--color-up)]" role="status">
            {successMessage}
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

      {portfolio.length === 0 ? (
        <EmptyState
          title="هنوز دارایی‌ای اضافه نکردی"
          description="یک کوین، مقدار و قیمت خرید وارد کن تا سود/زیان لحظه‌ای‌ت محاسبه بشه."
          actionLabel="مشاهده Markets"
          onAction={() => router.push("/market")}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
            </svg>
          </span>
        </EmptyState>
      ) : portfolioPricesError ? (
        <ErrorState
          title="Prices unavailable"
          description="Your holdings are saved, but live prices could not be loaded."
          onRetry={refetchPortfolioPrices}
        />
      ) : (
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
      )}
    </section>
  );
}
