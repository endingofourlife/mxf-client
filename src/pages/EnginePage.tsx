import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import SelectViewFromDataFrame from "../components/SelectViewFromDataFrame.tsx";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";
import styles from "./EnginePage.module.css";

function EnginePage() {
    const { id } = useParams();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    const [selectedView, setSelectedView] = useState("basic-metrics");
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
        if (activeObject && activeObject.id === Number(id)){
            setIsLoading(false);
            return;
        }
        fetchData();
    }, [activeObject, id, setActiveObject, setIsLoading]);

    function handleBackBtn(){
        navigate(-1);
    }

    if (!activeObject || isLoading) {
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
            />

            <EnginePriceCalculator
                selectedEngine={selectedEngine}
                realObject={activeObject}
            />

            <section className={styles.section}>
                <h2>Шахівниця цін</h2>
                <ChessboardTable
                    selectedMetric={selectedMetric}
                    premises={activeObject.premises}
                    dynamicConfig={activeObject.pricing_configs[0].content.dynamicConfig}
                    staticConfig={activeObject.pricing_configs[0].content.staticConfig}
                    ranging={activeObject.pricing_configs[activeObject.pricing_configs.length - 1].content.ranging}
                />
            </section>

            <section className={styles.section}>
                <h2>Вибір подання даних</h2>
                <SelectViewFromDataFrame onViewChange={setSelectedView} />
            </section>
        </main>
    );
}

export default EnginePage;