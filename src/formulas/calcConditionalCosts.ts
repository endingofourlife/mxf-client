import type {ScoredFlat} from "../interfaces/ScoredFlat.ts";

export function calculateConditionalCosts (
    flatsWithScores: ScoredFlat[],
    sp_mixed_rt_norm: number[],
    fit_spread_rate: number
): {
    conditionalCosts: { unitNumber: number; fit_cond_value: number; cond_cost: number }[];
    totalCondCost: number;
    premCondCostShr: number[];
} {
    const conditionalCosts: { unitNumber: number; fit_cond_value: number; cond_cost: number }[] = [];
    let total_cond_cost = 0;

    flatsWithScores.forEach((flatData, index) => {
        const area = flatData.area || 0;
        const fit_cond_value = 1 + (sp_mixed_rt_norm[index] / (fit_spread_rate || 1e-10)) || 0;
        const cond_cost = fit_cond_value * area;
        conditionalCosts.push({ unitNumber: flatData.unitNumber, fit_cond_value, cond_cost });
        total_cond_cost += cond_cost;
    });

    const prem_cond_cost_shr = conditionalCosts.map(({ cond_cost }) =>
        (total_cond_cost === 0 ? 0 : cond_cost / total_cond_cost));

    return { conditionalCosts, totalCondCost: total_cond_cost, premCondCostShr: prem_cond_cost_shr };
}
