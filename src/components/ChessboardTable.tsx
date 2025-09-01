import type {Premises} from "../interfaces/Premises.ts";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import { scoring } from "../core/scoring.ts";
import type {ColumnPriorities} from "./PremisesParameters.tsx";

interface ChessboardTableProps {
    premises: Premises[];
    selectedMetric: string;
    dynamicConfig: DynamicParametersConfig;
    staticConfig: StaticParametersConfig;
    ranging: ColumnPriorities;
}

function ChessboardTable({ premises, selectedMetric, staticConfig, dynamicConfig, ranging }: ChessboardTableProps) {
    // const [bonusDisplay, setBonusDisplay] = useState<boolean>(false);
    // const [presetIndex, setPresetIndex] = useState<number>(0);

    const floors = [...new Set(premises.map((item) => item.floor))].sort((a, b) => a - b);
    const units = [...new Set(premises.map((item) => item.number_of_unit))].sort((a, b) => a - b);

    function getMetricValue(floor: number, unit: number) {
        const item = premises.find((flat) => flat.floor === floor && flat.number_of_unit === unit);
        if (!item) return "N/A";

        if (selectedMetric === "Unit Number") {
            return item.number;
        } else if (selectedMetric === "Scoring") {
            const data = scoring(
                item,
                premises.filter(flat => flat.id !== item.id),
                dynamicConfig,
                staticConfig,
                ranging
            );
            console.log(data);
            return data;
        } else if (selectedMetric === "presetValue") {
            // TODO ??? - на основі скорінг
        } else if (selectedMetric === "actualPricePerSQM") {
            // TODO ????
            return item.price_per_meter;
        } else if (selectedMetric === "normContributeRT") {
            // TODO ????
        } else if (selectedMetric === "conditionalValue") {
            // TODO ????
        } else if (selectedMetric === "conditionalCost") {
            // TODO ????
        } else if (selectedMetric === "transformRate") {
            // TODO ????
        } else {
            return "N/A";
        }
    }

    return (
        <section>
            <h2>Chessboard table</h2>

            <table>
                <thead>
                    <tr>
                        {units.map((item) => (
                            <th key={item}>
                                Unit {item}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {floors.map((floor) => (
                        <tr key={floor}>
                            <td>{floor}</td>
                            {units.map((unit) => (
                                <td key={`${floor}_${unit}`}>
                                    {getMetricValue(floor, unit)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

export default ChessboardTable;