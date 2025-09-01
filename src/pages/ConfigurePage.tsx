import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import {useNavigate, useParams} from "react-router-dom";
import {createPricingConfig, fetchPricingConfig} from "../api/PricingConfigApi.ts";
import DynamicParameters from "../components/DynamicParameters.tsx";
import StaticParameters from "../components/StaticParameters.tsx";
import type {StaticParametersConfig} from "../interfaces/StaticParameters.ts";
import {getDynamicFromPricingConfig, getStaticFromPricingConfig} from "../core/Parsers.ts";
import type {DynamicParametersConfig} from "../interfaces/DynamicParametersConfig.ts";
import type {PricingConfig} from "../interfaces/PricingConfig.ts";
import PremisesParameters, {type ColumnPriorities} from "../components/PremisesParameters.tsx";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";

function ConfigurePage() {
    const { id } = useParams();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();
    // const [realEstateObject, setRealEstateObject] = useState<RealEstateObject | null>(null);
    const [dynamicConfig, setDynamicConfig] = useState<DynamicParametersConfig | null>(null);
    const [staticConfig, setStaticConfig] = useState<StaticParametersConfig | null>(null);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
    const [priorities, setPriorities] = useState<ColumnPriorities>({});
    const navigate = useNavigate();

    // Fetch estate object and pricing config (static and dynamic) data
    useEffect(() => {
        async function fetchData(){
            try {
                const response = await fetchRealEstateObject(Number(id));
                setActiveObject(response);
            } catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
            }
        }
        async function getPricingConfig(){
            try {
                const response = await fetchPricingConfig(Number(id));
                setStaticConfig(getStaticFromPricingConfig(response));
                setDynamicConfig(getDynamicFromPricingConfig(response));
                setPriorities(response.content?.ranging || {});
                setPricingConfig(response);
            } catch (error) {
                console.error("Error fetching pricing config:", error);
                alert('Не вдалося завантажити конфігурацію ціноутворення.');
            }
        }
        if (activeObject && activeObject.id === Number(id)){
            setStaticConfig(activeObject.pricing_configs[0].content.staticConfig);
            setDynamicConfig(activeObject.pricing_configs[0].content.dynamicConfig);
            console.log(activeObject);
            console.log('************************************')
            setPriorities(activeObject.pricing_configs[1].content.ranging || {});
            setIsLoading(false);
            return;
        }
        fetchData();
        getPricingConfig();
    }, [activeObject, id, setActiveObject, setIsLoading]);

    async function handleSaveConfig(){
        if (!dynamicConfig || !staticConfig || !id) {
            alert('Будь ласка, заповніть всі параметри');
            return;
        }

        try {
            const configToSave: PricingConfig = {
                id: pricingConfig?.id || 0,
                is_active: true,
                reo_id: Number(id),
                content: {
                    "staticConfig": staticConfig,
                    "dynamicConfig": dynamicConfig,
                    "ranging": priorities || {}
                },
                created_at: pricingConfig?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                real_estate_object: activeObject!,
                committed_prices: pricingConfig?.committed_prices || []
            };

            const response = await createPricingConfig(Number(id), configToSave);
            setPricingConfig(response);
            alert('Конфігурацію успішно збережено!');
        } catch (error) {
            console.error("Error saving pricing config:", error);
            alert('Не вдалося зберегти конфігурацію.');
        }
    }

    if (!activeObject || !activeObject.id || isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <h1>ConfigurePage</h1>
            <p>Конфігурація для об'єкта {activeObject?.name}</p>

            <DynamicParameters premises={activeObject.premises} currentConfig={dynamicConfig} onConfigChange={setDynamicConfig} />

            {dynamicConfig?.importantFields && (
                <PremisesParameters premises={activeObject.premises}
                                    selectedColumns={dynamicConfig?.importantFields}
                                    setPriorities={setPriorities}
                                    priorities={priorities}
                />
            )}
            <StaticParameters currentConfig={staticConfig}
                              setStaticConfig={setStaticConfig}
                              incomePlans={activeObject.income_plans || []}
                              premises={activeObject.premises || []}
            />

            <button onClick={handleSaveConfig}>Зберегти конфіг</button>
            <button onClick={() => {
                navigate(`/engine/${id}`);
            }}>Go to engine</button>
        </main>
    );
}

export default ConfigurePage;