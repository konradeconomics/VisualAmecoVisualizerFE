/**
 * Describes a variable selected by the user, including its code and name.
 */
export type SelectedVariable = { code: string; name: string };

/**
 * Toggles an item in an array of SelectedVariable objects based on the item's code.
 * If the item exists (matched by code), it's removed. Otherwise, it's added.
 * @param array The current array of SelectedVariable.
 * @param itemToAddOrRemove The SelectedVariable object to add or remove.
 * @returns A new array with the item toggled.
 */
export const toggleSelectedVariableArrayItem = (
    array: SelectedVariable[],
    itemToAddOrRemove: SelectedVariable
): SelectedVariable[] => {
    const exists = array.some((item) => item.code === itemToAddOrRemove.code);
    if (exists) {
        return array.filter((item) => item.code !== itemToAddOrRemove.code);
    } else {
        return [...array, itemToAddOrRemove];
    }
};

/**
 * Toggles a primitive item in an array.
 * If the item exists, it's removed. Otherwise, it's added.
 * @param array The current array of primitive items.
 * @param item The item to add or remove.
 * @returns A new array with the item toggled.
 */
export const togglePrimitiveArrayItem = <T>(array: T[], item: T): T[] =>
    array.includes(item) ? array.filter((i) => i !== item) : [...array, item];

/**
 * Represents the unique key for an indicator series, typically used for plotting.
 * For fetched indicators, it's often `${countryCode}-${variableCode}`.
 * For calculated series, it might be the `variableCode` of the CalculatedSeriesDto.
 */
export type IndicatorSeriesKey = string;

/**
 * Represents the unique identifier for a Y-axis, often derived from the unit category.
 */
export type YAxisId = string;