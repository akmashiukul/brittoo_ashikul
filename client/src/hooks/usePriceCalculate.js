export const usePriceCalculate = () => {
  function getScaleFactor(omv) {
    const m = -0.0001733;
    const b = 1.8867;
    const factor = m * omv + b;
    return Math.max(0.5, Math.min(1.8, factor));
  }

  function calculatePricePerDay(
    omv,
    condition,
    usageYears,
    securityScore,
    day,
  ) {
    const baseRates = {
      1: 0.022,
      2: 0.02,
      3: 0.019,
      4: 0.018,
      5: 0.016,
      6: 0.014,
      7: 0.012,
      8: 0.01,
      9: 0.009,
      10: 0.008,
    };
    const conditionMap = {
      "New": 1.0,
      "Like New": 0.9,
      "Good": 0.75,
      "Fair": 0.5,
      "Poor": 0.3,
    };
    const securityMap = {
      "Very Low": 1.2,
      "Low": 1.1,
      "Mid": 1.0,
      "High": 0.95,
      "Very High": 0.9,
    };
    const usageMultiplier =
      usageYears < 1
        ? 1.0
        : usageYears < 2
        ? 0.85
        : usageYears < 3
        ? 0.7
        : usageYears < 5
        ? 0.55
        : 0.4;
    const baseRate = baseRates[day] ?? 0.012;
    const basePrice = omv * baseRate;
    const scaleFactor = getScaleFactor(omv);
    const finalPrice =
      basePrice *
      conditionMap[condition] *
      usageMultiplier *
      securityMap[securityScore] *
      scaleFactor;

    return parseFloat(finalPrice.toFixed(2));
  }
  
  return { calculatePricePerDay };
};
