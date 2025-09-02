import type {Premises} from "../interfaces/Premises.ts";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import { scoring } from "../core/scoring.ts";
import type {ColumnPriorities} from "./PremisesParameters.tsx";
import styles from "./ChessboardTable.module.css";

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

    const getCellClassName = (value: string | number | undefined) => {
        if (typeof value === 'string' && value.includes('₴')) {
            return styles.currencyCell;
        }
        if (typeof value === 'number' || !isNaN(Number(value))) {
            return styles.numberCell;
        }
        return styles.textCell;
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Шахівниця цін</h2>
            <p className={styles.metricInfo}>Метрика: <strong>{selectedMetric}</strong></p>

            <div className={styles.tableContainer}>
                <table className={styles.chessboardTable}>
                    <thead>
                    <tr>
                        <th className={styles.cornerHeader}>Поверх/Квартира</th>
                        {units.map((item) => (
                            <th key={item} className={styles.unitHeader}>
                                №{item}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {floors.map((floor) => (
                        <tr key={floor} className={styles.floorRow}>
                            <td className={styles.floorHeader}>{floor}</td>
                            {units.map((unit) => {
                                const value = getMetricValue(floor, unit);
                                return (
                                    <td key={`${floor}_${unit}`} className={`${styles.cell} ${getCellClassName(value)}`}>
                                        {value}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.tableInfo}>
                <p>Всього поверхів: <strong>{floors.length}</strong></p>
                <p>Всього квартир: <strong>{units.length}</strong></p>
                <p>Всього одиниць: <strong>{premises.length}</strong></p>
            </div>
        </section>
    );
}

export default ChessboardTable;