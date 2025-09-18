import type { Premises } from "../interfaces/Premises.ts";
import type { DynamicParametersConfig } from "../interfaces/DynamicParametersConfig.ts";
import type { StaticParametersConfig } from "../interfaces/StaticParameters.ts";
import type { ColumnPriorities } from "../components/PremisesParameters.tsx";

interface FieldConfig {
    field: string;
    weight: number;
    priorities: ColumnPriorities[string];
}

interface SoldFlat {
    flat: Premises;
    features: number[];
    soldScore: number;
}

export function scoring(
    unitData: Premises,
    specData: Premises[],
    dynamicConfig: DynamicParametersConfig,
    staticConfig: StaticParametersConfig,
    ranging: ColumnPriorities
): string {
    console.log('Working with flat: ', unitData);

    if (!specData || !Array.isArray(specData) || specData.length === 0) {
        console.log('Returning 0.0000 due to empty specData');
        return "0.0000";
    }

    const selectedFields = Object.keys(dynamicConfig.importantFields).filter(
        (f) => dynamicConfig.importantFields[f]
    );
    if (selectedFields.length === 0) {
        console.log('Returning 0.0000 due to no selected important fields');
        return "0.0000";
    }

    const scoringFields: FieldConfig[] = selectedFields.map((field) => ({
        field,
        weight: dynamicConfig.weights[field] || 0,
        priorities: ranging[field] || []
    }));
    console.log('Scoring fields:', scoringFields);

    const weights = scoringFields.map((field) => parseFloat(field.weight.toString()) || 0);
    console.log('Weights:', weights);

    const getRankForField = (flat: Premises, fieldConfig: FieldConfig): number => {
        const fieldName = fieldConfig.field;
        const priorities = fieldConfig.priorities || [];
        const value = flat[fieldName as keyof Premises];

        if (typeof value === "number" || !isNaN(parseFloat(value as string))) {
            const numericValue = typeof value === "number" ? value : parseFloat(value as string);

            for (const priorityGroup of priorities) {
                if (priorityGroup.values.includes(numericValue.toString())) {
                    return priorityGroup.priority;
                }
            }

            return Math.max(...priorities.map(p => p.priority), 1);
        }

        const stringValue = value?.toString() || "";
        for (const priorityGroup of priorities) {
            if (priorityGroup.values.includes(stringValue)) {
                return priorityGroup.priority;
            }
        }

        return Math.max(...priorities.map(p => p.priority), 1);
    };

    const maxRanks = scoringFields.map((fieldConfig) =>
        Math.max(...(fieldConfig.priorities?.map(p => p.priority) || [1]), 1)
    );
    console.log('Max ranks:', maxRanks);

    const soldFlats: SoldFlat[] = specData
        .filter((flat) => flat.status === "sold")
        .map((flat) => ({
            flat,
            features: scoringFields.map((fieldConfig) => getRankForField(flat, fieldConfig)),
            soldScore: 1.0,
        }));

    console.log('Sold flats:', soldFlats);

    const targetRanks = scoringFields.map((fieldConfig) => getRankForField(unitData, fieldConfig));
    console.log('Target ranks:', targetRanks);

    const targetFlat = { features: targetRanks };
    console.log('Target flat features:', targetFlat.features);

    if (soldFlats.length === 0) {
        const inverseRanks = targetRanks.map((rank, i) => maxRanks[i] - rank + 1);
        const rawScore = inverseRanks.reduce((sum, rank, i) => sum + rank * weights[i], 0);
        return rawScore.toFixed(4);
    }

    // Нормалізуємо ваги
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);

    let totalScore = 0;
    let totalSimilarity = 0;
    const similarityThreshold = staticConfig.similarityThreshold;
    const sigma = staticConfig.sigma;
    const maxBonus = staticConfig.maxBonus;
    const bonusFactor = staticConfig.bonusFactor;

    console.log('Similarity threshold:', similarityThreshold);
    console.log('Sigma:', sigma);
    console.log('Max bonus:', maxBonus);
    console.log('Bonus factor:', bonusFactor);

    soldFlats.forEach((soldFlat) => {
        // Обчислюємо нормалізовану відстань з урахуванням ваг
        let weightedDistance = 0;
        soldFlat.features.forEach((rank, i) => {
            const diff = Math.abs(targetFlat.features[i] - rank);
            const normalizedDiff = diff / maxRanks[i]; // Нормалізуємо різницю
            weightedDistance += normalizedWeights[i] * normalizedDiff;
        });

        // Гаусівська функція подібності
        const similarity = Math.exp(-weightedDistance * weightedDistance / (2 * sigma * sigma));

        if (similarity > similarityThreshold) {
            // Розраховуємо бонус на основі подібності
            const bonus = maxBonus * (1 - weightedDistance) * bonusFactor;

            totalScore += similarity * (1 + bonus);
            totalSimilarity += similarity;
        }
    });

    const finalScore = totalSimilarity > 0 ? totalScore / totalSimilarity : 0;
    console.log('Final score:', finalScore);
    return finalScore.toFixed(4);
}