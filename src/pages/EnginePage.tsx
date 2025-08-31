import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EngineHeader from "../components/EngineHeader.tsx";
import EnginePriceCalculator from "../components/EnginePriceCalculator.tsx";
import ChessboardTable from "../components/ChessboardTable.tsx";
import SelectViewFromDataFrame from "../components/SelectViewFromDataFrame.tsx";

function EnginePage() {
    const { id } = useParams();
    const [realEstateObject, setRealEstateObject] = useState<RealEstateObject | null>(null);
    const [selectedEngine, setSelectedEngine] = useState("Regular");
    const [selectedMetric, setSelectedMetric] = useState("Unit Number");
    const [selectedView, setSelectedView] = useState("basic-metrics");

    // Fetch estate object and pricing config (static and dynamic) data
    useEffect(() => {
        async function fetchData(){
            try {
                const response = await fetchRealEstateObject(Number(id));
                console.log(response);
                setRealEstateObject(response);
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
            }
        }
        fetchData();
    }, [id]);

    if (!realEstateObject) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <h2>Engine Page</h2>
            <EngineHeader
                objectName={realEstateObject.name}
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
            />
            <EnginePriceCalculator
                selectedEngine={selectedEngine}
                realObject={realEstateObject}
            />
            <ChessboardTable
                selectedMetric={selectedMetric}
                premises={realEstateObject.premises}
            />
            <SelectViewFromDataFrame onViewChange={setSelectedView} />
        </main>
    );
}

export default EnginePage;