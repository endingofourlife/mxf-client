import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import SelectViewFromDataFrame from "../components/SelectViewFromDataFrame.tsx";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";

function EnginePage() {
    const { id } = useParams();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();
    // const [realEstateObject, setRealEstateObject] = useState<RealEstateObject | null>(null);
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    const [selectedView, setSelectedView] = useState("basic-metrics");

    // Fetch estate object and pricing config (static and dynamic) data
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

    if (!activeObject || isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <h2>Engine Page</h2>
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
            <ChessboardTable
                selectedMetric={selectedMetric}
                premises={activeObject.premises}
                dynamicConfig={activeObject.pricing_configs[0].content.dynamicConfig}
                staticConfig={activeObject.pricing_configs[0].content.staticConfig}
                ranging={activeObject.pricing_configs[0].content.ranging}
            />
            <SelectViewFromDataFrame onViewChange={setSelectedView} />
        </main>
    );
}

export default EnginePage;