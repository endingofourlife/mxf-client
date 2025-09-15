import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import ShowCalculationProcessTable from "../components/ShowCalculationProcessTable.tsx";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./EnginePage.module.css";
import {fetchDistributionConfigs} from "../api/DistributionConfigApi.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

export interface CalculationProcessData {
    onBoardingSpread: number;
    compensationRate: number;
    conditionalValue: number;
}

function EnginePage() {
    const { id } = useParams();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    //const [selectedView, setSelectedView] = useState("basic-metrics");
    const [scoringData, setScoringData] = useState<Record<number, number | string>>({});
    const [calculationProcessData, setCalculationProcessData] = useState<CalculationProcessData | null>(null);
    const [distribConfig, setDistribConfig] = useState<DistributionConfig[]>([]);
    const [activeConfig, setActiveConfig] = useState<number | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData(){
            try {
                const response = await fetchRealEstateObject(Number(id));
                console.log(response);
                setActiveObject(response);
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
            } finally {
                setIsLoading(false);
            }
        }

        async function getDistribConfig(){
            try {
                const response = await fetchDistributionConfigs();
                setDistribConfig(response);
            } catch (error) {
                console.error("Error fetching distribution configs:", error);
                alert('Не вдалося завантажити конфігурації розподілу.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
        getDistribConfig();
    }, [id, setActiveObject, setIsLoading]);

    function handleBackBtn(){
        navigate(-1);
    }

    if (!activeObject || isLoading || distribConfig.length === 0 || activeObject.pricing_configs.length === 0) {
        return <div className={styles.loading}>Завантаження...</div>;
    }

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Engine</h1>
                <button onClick={handleBackBtn} className={styles.backButton}>
                    Назад
                </button>
            </header>

            <p className={styles.objectInfo}>
                Engine для об'єкта: <strong>{activeObject?.name}</strong>
            </p>

            <EngineHeader
                objectName={activeObject.name}
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                configs={distribConfig}
                setActiveConfig={setActiveConfig}
            />

            <EnginePriceCalculator
                selectedEngine={selectedEngine}
                realObject={activeObject}
                setCalculationProcessData={setCalculationProcessData}
            />
            <section className={styles.section}>
                <h2>Шахівниця цін</h2>
                <ChessboardTable
                    selectedMetric={selectedMetric}
                    premises={activeObject.premises}
                    dynamicConfig={activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.dynamicConfig}
                    staticConfig={activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.staticConfig}
                    ranging={activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.ranging}
                    setScoringData={setScoringData}
                />
            </section>

            <section className={styles.section}>
                <h1>Ця частина сторінки і результати з'являються при рендері сторінки. Нічого робити не потрібно. Для простоти береться останній збережений конфіг.</h1>
                <ShowCalculationProcessTable
                    activeConfig={distribConfig[distribConfig.length-1]}
                    activeObject={activeObject}
                />
            </section>
        </main>
    );
}

export default EnginePage;