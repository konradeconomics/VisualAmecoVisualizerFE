/**
 * Returns a readable unit string.
 * Primarily relies on the unitDescription provided from the backend.
 * The unitCode is kept as an optional parameter for potential future use or logging,
 * but is not actively used for mapping in this version.
 */
export const getReadableUnit = (
    unitCode: string | number,
    unitDescription: string
): string => {
    if (unitDescription && unitDescription.trim() !== "") {
        return unitDescription;
    }

    return `Code: ${String(unitCode)}`;
};

export type UnitCategory =
    | 'Currency'     // For monetary values (ECU, EUR, national currency)
    | 'PPS'          // Purchasing Power Standards
    | 'Percentage'   // For % of X, or explicit percentages, rates
    | 'Share'        // For explicit shares
    | 'Index'        // For "2015=100" type indices
    | 'Count'        // For persons, FTEs, etc.
    | 'Ratio'        // For other ratios not explicitly percentages (e.g., capital output ratio)
    | 'Productivity' // For productivity/efficiency measures if they don't fit elsewhere cleanly
    | 'Other';       // Fallback

/**
 * Attempts to categorize a given readable unit string.
 * This helps in deciding if different Y-axes are needed.
 * You will need to refine the keywords based on your actual UnitDescription strings.
 */
export const getUnitCategory = (readableUnit: string): UnitCategory => {
    if (!readableUnit) return 'Other';
    const unitLower = readableUnit.toLowerCase();

    // Most specific checks first
    if (unitLower.includes("(2015 = 100)") || unitLower.includes("2015=100")) { // Covers various index formats
        return 'Index';
    }
    if (unitLower.includes("percentage of") || unitLower.includes("(percentage") || unitLower.endsWith('%')) {
        return 'Percentage';
    }
    if (unitLower.includes("share")) { // Specific keyword for Share
        return 'Share';
    }
    if (unitLower.includes("rate") && !unitLower.includes("exchange rates")) { // "Rate" often implies percentage or ratio, unless it's an exchange rate (currency)
        return 'Percentage'; // Or 'Ratio' depending on context, for now grouping with Percentage
    }
    if (unitLower.includes("mrd ecu/eur") || unitLower.includes("1000 ecu/eur") || unitLower.includes("mrd eur")) {
        return 'Currency'; // Could also be 'EUR' as a sub-category if needed
    }
    if (unitLower.includes("national currency") && !unitLower.includes("2015 = 100")) { // Avoid capturing "National currency: 2015 = 100" as currency here
        return 'Currency';
    }
    if (unitLower.includes("pps")) {
        return 'PPS';
    }
    if (unitLower.includes("1000 persons") || unitLower.includes("1000 fte's")) {
        return 'Count';
    }
    if (unitLower.includes("capital output ratio")) {
        return 'Ratio';
    }
    if (unitLower.includes("capital productivity") || unitLower.includes("total factor productivity") || unitLower.includes("marginal efficiency")) {
        // These might be indices or ratios. Let's tentatively group them.
        // Or they could be specific enough to warrant their own category if they need a unique axis.
        return 'Productivity'; // Or 'Index' or 'Ratio' depending on how you want to group
    }

    // Broader fallback checks
    if (unitLower.includes("persons") || unitLower.includes("capita") || unitLower.includes("population") || unitLower.includes("employment") || unitLower.includes("employee")) {
        return 'Count';
    }
    if (unitLower.includes("eur") || unitLower.includes("ecu")) { // General EUR/ECU if not caught by Mrd/1000
        return 'Currency';
    }
    if (unitLower.includes("ratio")) { // General ratio
        return 'Ratio';
    }

    console.warn(`Unit "${readableUnit}" categorized as 'Other'. Review unitMapper.ts for more specific categorization.`);
    return 'Other';
}