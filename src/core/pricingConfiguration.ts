import type { IncomePlan } from '../interfaces/IncomePlan.ts';
import type { Premises } from '../interfaces/Premises.ts';

interface UnitData {
    current_price_per_sqm?: string;
}

interface Config {
    oversold_method: 'pieces' | 'area';
}

export function calculateOnboardingPrice(
    unitData: UnitData,
    specData: Premises[],
    config: Config,
    incomePlans: IncomePlan[]
): number {
    console.log('calculateOnboardingPrice called with:', {
        specDataLength: specData?.length,
        incomePlansLength: incomePlans?.length,
        config,
        unitData,
    });

    if (!Array.isArray(specData)) {
        console.warn('specData is not an array, returning 0');
        return 0;
    }

    // Calculate soldout based on oversold_method
    const soldout = calculateSoldout(specData, config);
    console.log('Calculated soldout:', soldout);

    if (!incomePlans || incomePlans.length === 0) {
        console.log('No income plans, using unit data price');
        return parseFloat(unitData.current_price_per_sqm || '0');
    }

    // Sort income plans by period_begin
    const sortedPlans = [...incomePlans].sort(
        (a, b) => new Date(a.period_begin).getTime() - new Date(b.period_begin).getTime()
    );
    console.log('Sorted income plans:', sortedPlans);

    let basePrice = 0;

    // Define soldout ranges (e.g., 0 to 1 split evenly across plans)
    for (let i = 0; i < sortedPlans.length; i++) {
        const current = sortedPlans[i];
        const next = i + 1 < sortedPlans.length ? sortedPlans[i + 1] : null;

        // Assume each plan covers an equal portion of soldout (0 to 1)
        const start = i / sortedPlans.length;
        const end = next ? (i + 1) / sortedPlans.length : 1.0;

        const priceStart = current.price_per_sqm;
        const priceEnd = next ? next.price_per_sqm : priceStart;

        console.log(`Plan ${i}: start=${start}, end=${end}, priceStart=${priceStart}, priceEnd=${priceEnd}`);

        if (soldout >= start && soldout <= end) {
            let progress = 0;
            if (end !== start) {
                progress = (soldout - start) / (end - start);
            }
            basePrice = priceStart + (priceEnd - priceStart) * progress;
            console.log(`Matched! soldout=${soldout}, progress=${progress}, basePrice=${basePrice}`);
            break;
        }
    }

    if (basePrice === 0 && sortedPlans.length > 0) {
        basePrice = sortedPlans[0].price_per_sqm;
        console.log('Using first plan price:', basePrice);
    }

    console.log('Final price:', basePrice);
    return parseFloat(basePrice.toFixed(3));
}

export const calculateSoldout = (specData: Premises[], config: Config): number => {
    console.log('calculateSoldout called with:', {
        specDataLength: specData?.length,
        config,
    });

    if (!Array.isArray(specData)) {
        console.warn('specData is not an array, returning 0');
        return 0;
    }

    const totalUnits = specData.length;
    const soldUnits = specData.filter((item) => item.status === 'sold');

    console.log('Total units:', totalUnits, 'Sold units:', soldUnits.length);

    if (config.oversold_method === 'area') {
        const totalArea = specData.reduce((sum, item) => sum + (item.estimated_area_m2 || 0), 0);
        const soldArea = soldUnits.reduce((sum, item) => sum + (item.estimated_area_m2 || 0), 0);
        const ratio = totalArea > 0 ? soldArea / totalArea : 0;
        console.log('Area method - totalArea:', totalArea, 'soldArea:', soldArea, 'ratio:', ratio);
        return parseFloat(ratio.toFixed(2));
    } else {
        const ratio = totalUnits > 0 ? soldUnits.length / totalUnits : 0;
        console.log('Pieces method - ratio:', ratio);
        return parseFloat(ratio.toFixed(2));
    }
};