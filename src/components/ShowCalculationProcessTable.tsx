import type { Premises } from "../interfaces/Premises.ts";
import type { CalculationProcessData } from "../pages/EnginePage.tsx";
import type { ColumnPriorities } from "./PremisesParameters.tsx";
import type { DistributionConfig } from "../interfaces/DistributionConfig.ts";

interface SelectViewFromDataFrameProps {
    premises: Premises[];
    scoringData: Record<number, number | string>;
    calculationProcessData: CalculationProcessData;
    ranging: ColumnPriorities;
    distribConfigs?: DistributionConfig[];
    activeConfigId?: number | null;
}

function ShowCalculationProcessTable({
                                         premises,
                                         scoringData,
                                         calculationProcessData,
                                         ranging,
                                         distribConfigs,
                                         activeConfigId,
                                     }: SelectViewFromDataFrameProps) {
    // Get the active distribution config
    function getActiveConfig() {
        console.log(`Retrieving active configuration with activeConfigId: ${activeConfigId}`);
        if (!distribConfigs || !activeConfigId) {
            console.log('No distribution configs or activeConfigId provided, returning null');
            return null;
        }
        const config = distribConfigs.find((config) => config.id === activeConfigId) || null;
        console.log(`Active config found: ${config ? JSON.stringify(config, null, 2) : 'None'}`);
        return config;
    }

    // Calculate conditional cost
    function getConditionalCosts(premise: Premises) {
        return (premise.total_area_m2 * (calculationProcessData?.conditionalValue || 1)).toFixed(2);
    }

    // Preset distribution functions
    const uniformPreset = (length: number) => {
        return Array.from({ length }, (_, i) => (i + 1) / length);
    };

    const gaussianPreset = (length: number, params: { mean?: number; stdDev?: number }) => {
        const mean = params.mean || 0.5;
        const stdDev = params.stdDev || 1 / 6;
        return Array.from({ length }, (_, i) => {
            const x = (i + 1) / length;
            const z = (x - mean) / stdDev;
            return Math.exp(-0.5 * z * z);
        });
    };

    const bimodalPreset = (length: number, params: { mean1?: number; mean2?: number; stdDev?: number }) => {
        const mean1 = params.mean1 || 1 / 3;
        const mean2 = params.mean2 || 2 / 3;
        const stdDev = params.stdDev || 1 / 10;
        return Array.from({ length }, (_, i) => {
            const x = (i + 1) / length;
            const z1 = (x - mean1) / stdDev;
            const z2 = (x - mean2) / stdDev;
            return Math.exp(-0.5 * z1 * z1) + Math.exp(-0.5 * z2 * z2);
        });
    };

    // Map function types to preset functions
    const presetFunctions: Record<string, (length: number, params: any) => number[]> = {
        Uniform: uniformPreset,
        Gaussian: gaussianPreset,
        Bimodal: bimodalPreset,
    };

    // Compute preset values using maxRank
    const computePresetValues = () => {
        const maxRank = premises.length;
        const activeConfig = getActiveConfig();
        const functionType = activeConfig?.content?.function_type || "Uniform";
        const params = activeConfig?.content || {};
        const presetFunc = presetFunctions[functionType] || uniformPreset;

        // Generate normalized ranks
        const normRanks = uniformPreset(maxRank); // [1/maxRank, 2/maxRank, ..., 1]
        const rawPresetValues = presetFunc(maxRank, params);

        // Map normalized ranks to preset values
        return normRanks.map((normRank) => {
            const index = Math.floor((normRank - (1 / maxRank)) * (maxRank - 1));
            return rawPresetValues[index] || rawPresetValues[rawPresetValues.length - 1];
        });
    };

    // Sort premises by scoring and assign preset values
    const sortedPremises = [...premises]
        .map((premise, index) => ({
            ...premise,
            scoring: parseFloat(String(scoringData[premise.id])) || 0,
            originalIndex: index,
        }))
        .sort((a, b) => a.scoring - b.scoring);

    const presetValues = computePresetValues();

    // Map premises to include preset values
    const premisesWithPreset = sortedPremises.map((premise, index) => ({
        ...premise,
        presetValue: presetValues[index] || 0,
    }));

    // Re-sort back to original order for display
    const displayPremises = premisesWithPreset.sort((a, b) => a.originalIndex - b.originalIndex);

    return (
        <section>
            <h2>Процес розрахунків</h2>




            <h2>
                Вибраний конфіг
                <pre>{JSON.stringify(getActiveConfig(), null, 2)}</pre>
            </h2>

            <table>
                <thead>
                <tr>
                    <th>Premises ID</th>
                    <th>Number</th>
                    <th>Status</th>
                    <th>Estimated Area m2</th>
                    <th>Floor</th>
                    <th>Number of unit</th>
                    <th>Scoring</th>
                    <th>Preset Value</th>
                    <th>OnBoarding Spread</th>
                    <th>Compensation Rate</th>
                    <th>Conditional Value</th>
                    <th>Conditional Cost</th>
                    <th>Total Conditional Cost</th>
                    <th>Total Actual Cost</th>
                    <th>Transform Rate</th>
                    <th>Actual price per SQM</th>
                </tr>
                </thead>
                <tbody>
                {displayPremises.map((premise) => (
                    <tr key={premise.id}>
                        <td>{premise.premises_id}</td>
                        <td>{premise.number}</td>
                        <td>{premise.status}</td>
                        <td>{premise.estimated_area_m2}</td>
                        <td>{premise.floor}</td>
                        <td>{premise.number_of_unit}</td>
                        <td>{premise.scoring === 0 ? "N/A" : premise.scoring.toFixed(2)}</td>
                        <td>{premise.presetValue.toFixed(4)}</td>
                        <td>{calculationProcessData?.onBoardingSpread?.toFixed(4) ?? "N/A"}</td>
                        <td>{calculationProcessData?.compensationRate?.toFixed(4) ?? "N/A"}</td>
                        <td>{calculationProcessData?.conditionalValue?.toFixed(4) ?? "N/A"}</td>
                        <td>{getConditionalCosts(premise)}</td>
                        <td>{"N/A"}</td> {/* Placeholder for Total Conditional Cost */}
                        <td>{"N/A"}</td> {/* Placeholder for Total Actual Cost */}
                        <td>{"N/A"}</td> {/* Placeholder for Transform Rate */}
                        <td>{premise.price_per_meter}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
}

export default ShowCalculationProcessTable;