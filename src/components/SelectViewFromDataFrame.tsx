interface SelectViewFromDataFrameProps {
    onViewChange?: (viewId: string) => void;
}

function SelectViewFromDataFrame({ onViewChange }: SelectViewFromDataFrameProps) {
    const views = [
        {
            "id": "basic-metrics",
            "name": "Основні метрики",
            "columns": [
                "Number",
                "Premises ID",
                "Status",
                "Estimated area, m2",
                "Floor",
                "Number of unit",
                "Scoring",
                "presetValue",
                "onboardingSpread",
                "compensationRate",
                "conditionalValue",
                "conditionalCost",
                "totalConditionalCost",
                "totalActualCost",
                "transformRate",
                "actualPricePerSQM"
            ]
        },
        {
            "id": "financial-metrics",
            "name": "Фінансові метрики",
            "columns": [
                "Current price per sqm",
                "Soldout",
                "conditionalAmount",
                "ascScoringRank"
            ]
        },
        {
            "id": "availability-analysis",
            "name": "Аналіз доступності",
            "columns": [
                "Unit Number",
                "Current Period",
                "normContributeRT"
            ]
        }
    ]

    function handleViewChange(e: ChangeEvent<HTMLSelectElement>) {
        const selectedViewId = e.target.value;
        if (onViewChange) {
            onViewChange(selectedViewId);
        }
    }

    return (
        <section>
            <h2>Виберіть вью</h2>
            <p>
                <label htmlFor="view">
                    Вью:
                    <select name="view" id="view">
                        {views.map((view) => (
                            <option
                                key={view.id}
                                value={view.id}
                                onClick={handleViewChange}
                            >
                                {view.name}
                            </option>
                        ))}
                    </select>
                </label>
            </p>
        </section>
    );
}

export default SelectViewFromDataFrame;