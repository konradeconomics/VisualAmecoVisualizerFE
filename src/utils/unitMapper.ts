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
    | 'Currency'
    | 'Percentage'
    | 'Index'
    | 'Count'
    | 'PPS'       // Purchasing Power Standards
    | 'Ratio'
    | 'Original'
    | 'Other';

/**
 * Attempts to categorize a given readable unit string.
 * This helps in deciding if different Y-axes are needed.
 * You will need to refine the keywords based on your actual UnitDescription strings.
 */
export const getUnitCategory = (readableUnit: string): UnitCategory => {
    if (!readableUnit) return 'Other';
    const unitLower = readableUnit.toLowerCase();

    if (unitLower.startsWith("% of") || unitLower.includes("percentage of") || unitLower.endsWith('%')) {
        return 'Percentage';
    }
    if (unitLower.includes("pps")) { // Purchasing Power Standards
        return 'PPS';
    }
    if (unitLower.includes("ecu/eur") || unitLower.includes("eur") || unitLower.includes("national currency") || unitLower.includes("mrd") || unitLower.includes("bn") || unitLower.includes("million") || unitLower.includes("billion")) {
        return 'Currency';
    }
    if (unitLower.includes("index") || unitLower.match(/\b\d{4}=100\b/) || unitLower.includes("base year")) {
        return 'Index';
    }
    if (unitLower.includes("persons") || unitLower.includes("capita") || unitLower.includes("population") || unitLower.includes("employment") || unitLower.includes("employee")) {
        return 'Count';
    }
    if ((unitLower.includes("thousand") || unitLower.includes("ths")) && !unitLower.includes("currency") && !unitLower.includes("eur")) {
        return 'Count';
    }
    if (unitLower.includes("ratio") || (unitLower.includes("/") && !unitLower.includes("ecu/eur"))) {
        return 'Ratio';
    }

    if (unitLower.includes("original units")) {
        return 'Other';
    }

    return 'Other'; // Default fallback category
};