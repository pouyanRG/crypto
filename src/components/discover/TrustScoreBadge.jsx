import Badge from "../ui/Badge";
import { getTrustTier, trustTierVariant } from "../../lib/exchanges";

export default function TrustScoreBadge({ score }) {
  const tier = getTrustTier(score);
  const variant = trustTierVariant(tier);

  return (
    <Badge
      variant={variant}
      className="min-w-14 justify-center"
      aria-label={score == null ? "Trust score unavailable" : `Trust score ${score} out of 10`}
    >
      {score == null ? "—" : `${score}/10`}
    </Badge>
  );
}
