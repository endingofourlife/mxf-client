import type {Premises} from "../interfaces/Premises.ts";
import {useEffect, useState} from "react";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";

interface DynamicParametersProps {
    premises: Premises[];
    currentConfig: DynamicParametersConfig | null;
    onConfigChange: (config: DynamicParametersConfig) => void;
}

function DynamicParameters({premises, currentConfig, onConfigChange}: DynamicParametersProps) {
    const [config, setConfig] = useState<DynamicParametersConfig>({
        importantFields: {},
        weights: {},
    });
    const selectedFields = Object.keys(config.importantFields);

    useEffect(() => {
        if (currentConfig) {
            setConfig(currentConfig);
        }
    }, [currentConfig]);

    function getAvailableFields(): string[]{
        const firstPremise = premises[0];
        return Object.keys(firstPremise).filter(key =>
            key !== 'id' && key !== 'reo_id' && key !== "uploaded"
        );
    }

    function handleFieldToggle(field: string) {
        const newImportantFields = { ...config.importantFields };
        const currentlySelected = newImportantFields[field];

        if (currentlySelected) {
            delete newImportantFields[field];
        } else {
            newImportantFields[field] = true;
        }

        const selectedFields = Object.keys(newImportantFields);
        const newWeights: Record<string, number> = {};

        selectedFields.forEach(fieldName => {
            newWeights[fieldName] = 1 / selectedFields.length;
        });

        const newConfig = {
            importantFields: newImportantFields,
            weights: newWeights,
        }

        setConfig(newConfig);
        onConfigChange(newConfig);
    }

    function handleWeightChange(field: string, newWeight: number) {
        const newWeights = { ...config.weights };
        newWeights[field] = newWeight;

        const totalWeight = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(newWeights).forEach(key => {
            newWeights[key] = newWeights[key] / totalWeight;
        });

        const newConfig = {
            importantFields: config.importantFields,
            weights: newWeights
        };

        setConfig(newConfig);
        onConfigChange(newConfig);
    }

    const totalWeight = Object.values(config.weights).reduce((sum, weight) => sum + weight, 0);

    return (
        <section>
            <h3>Оберіть поля для аналізу</h3>

            {currentConfig && (
                <details>
                    <summary>Поточні динамічні параметри</summary>
                    <pre>{JSON.stringify(currentConfig, null, 2)}</pre>
                </details>
            )}

            {getAvailableFields().map(field => (
                <label key={field}>
                    <input
                        type="checkbox"
                        checked={config.importantFields[field]}
                        onChange={() => handleFieldToggle(field)}
                        id={`${field}_box`}
                    />
                    {field}
                </label>
            ))}

            {selectedFields.length > 0 && (
                <section>
                    <h4>Ваги полів</h4>
                    <p>Загальна вага: {(totalWeight * 100).toFixed(1)}%</p>

                    {selectedFields.map(field => (
                        <div key={field}>
                            <label htmlFor={`${field}_slider`}>
                                {field}
                            </label>
                            <input
                                id={`${field}_slider`}
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={(config.weights[field] * 100) || 0}
                                onChange={(e) => handleWeightChange(field, Number(e.target.value) / 100)}
                            />
                            <p>
                                {((config.weights[field] || 0) * 100).toFixed(1)}%
                            </p>
                        </div>
                    ))}
                </section>
            )}
        </section>
    );
}

export default DynamicParameters;