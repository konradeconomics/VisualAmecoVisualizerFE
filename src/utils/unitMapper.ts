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
    if (unitLower.includes("(2015 = 100)") || unitLower.includes("2015=100")) {
        return 'Index';
    }
    if (unitLower.includes("percentage of") || unitLower.includes("(percentage") || unitLower.endsWith('%')) {
        return 'Percentage';
    }
    if (unitLower.includes("share")) {
        return 'Share';
    }
    if (unitLower.includes("rate") && !unitLower.includes("exchange rates")) {
        return 'Percentage';
    }
    if (unitLower.includes("mrd ecu/eur") || unitLower.includes("1000 ecu/eur") || unitLower.includes("mrd eur")) {
        return 'Currency';
    }
    if (unitLower.includes("national currency") && !unitLower.includes("2015 = 100")) {
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
        return 'Productivity';
    }

    // Broader fallback checks
    if (unitLower.includes("persons") || unitLower.includes("capita") || unitLower.includes("population") || unitLower.includes("employment") || unitLower.includes("employee")) {
        return 'Count';
    }
    if (unitLower.includes("eur") || unitLower.includes("ecu")) {
        return 'Currency';
    }
    if (unitLower.includes("ratio")) {
        return 'Ratio';
    }

    console.warn(`Unit "${readableUnit}" categorized as 'Other'. Review unitMapper.ts for more specific categorization.`);
    return 'Other';
}