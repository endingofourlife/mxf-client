import {useEffect, useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
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

function ConfigurePage() {
    const { id } = useParams();
    const [realEstateObject, setRealEstateObject] = useState<RealEstateObject | null>(null);
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
                setRealEstateObject(response);
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
        fetchData();
        getPricingConfig();
    }, [id]);

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
                real_estate_object: realEstateObject!,
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

    if (!realEstateObject) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            <h1>ConfigurePage</h1>
            <p>Конфігурація для об'єкта {realEstateObject?.name}</p>

            <DynamicParameters premises={realEstateObject.premises} currentConfig={dynamicConfig} onConfigChange={setDynamicConfig} />

            {dynamicConfig?.importantFields && (
                <PremisesParameters premises={realEstateObject.premises}
                                    selectedColumns={dynamicConfig?.importantFields}
                                    setPriorities={setPriorities}
                                    priorities={priorities}
                />
            )}
            <StaticParameters currentConfig={staticConfig}
                              setStaticConfig={setStaticConfig}
                              incomePlans={realEstateObject.income_plans || []}
                              premises={realEstateObject.premises || []}
            />

            <button onClick={handleSaveConfig}>Зберегти конфіг</button>
            <button onClick={() => {
                navigate(`/engine/${id}`);
            }}>Go to engine</button>
        </main>
    );
}

export default ConfigurePage;