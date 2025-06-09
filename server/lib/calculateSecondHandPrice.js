export function calculateSecondHandPrice(omv, condition, usageYears) {
  if (omv < 0 || !Number.isFinite(omv)) {
    throw new Error("OMV must be a non-negative number");
  }
  if (!["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"].includes(condition)) {
    throw new Error("Invalid condition");
  }
  if (usageYears < 0 || !Number.isFinite(usageYears)) {
    throw new Error("Usage years must be non-negative");
  }

  const baseDepreciationRate = 0.97;
  const conditionMap = {
    NEW: 1.0,
    LIKE_NEW: 0.98,  // 2% drop
    GOOD: 0.93,      // 7% drop
    FAIR: 0.88,      // 12% drop
    POOR: 0.70       // 30% drop
  };

  const usageMultiplier =
    usageYears < 1
      ? 0.99
      : usageYears < 2
        ? 0.97
        : usageYears < 3
          ? 0.92
          : usageYears < 5
            ? 0.85
            : usageYears < 8
              ? 0.75
              : 0.60;


  const finalPrice = omv * baseDepreciationRate * conditionMap[condition] * usageMultiplier;

  return Math.max(1.0, parseFloat(finalPrice.toFixed(2)));
}