"use client";

import { useState } from "react";
import { getCountryIso } from "../../lib/exchanges";
import NavIcon from "../layout/NavIcon";

export default function CountryFlag({ country, showName = false }) {
  const iso = getCountryIso(country);
  const [imageFailed, setImageFailed] = useState(false);

  const hasFlag = Boolean(iso) && !imageFailed;

  return (
    <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      {hasFlag ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w40/${iso}.png`}
            alt=""
            width={24}
            height={18}
            loading="lazy"
            decoding="async"
            className="h-[18px] w-6 shrink-0 rounded-[3px] object-cover"
            onError={() => setImageFailed(true)}
          />
        </>
      ) : (
        <NavIcon name="globe" className="size-4" />
      )}
      {showName ? <span>{country || "—"}</span> : country ? <span>{country}</span> : <span>—</span>}
    </span>
  );
}
