export function calculateFitCondValues(spMixedRtNorm: number[], fitSpreadRate: number): number[] {
    // Check for invalid inputs
    if (!spMixedRtNorm || !fitSpreadRate) {
        console.warn('Invalid inputs or mismatched array lengths, returning an array with a small value.');
        return [1e-10];
    }

    // Calculate 1 + (spMixedRtNorm[i] / fitSpreadRate[i]) for each element
    return spMixedRtNorm.map((value, index) => {
        const divisor = fitSpreadRate;
        // Check for zero division
        if (divisor === 0) {
            console.warn(`Zero found in fitSpreadRate at index ${index}, using small value.`);
            return 1e-10;
        }
        return 1 + value / divisor;
    });
}