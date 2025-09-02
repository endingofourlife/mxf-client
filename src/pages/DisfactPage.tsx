import React, {useEffect, useState} from 'react';
import CreateDistributionPresetForm from "../components/CreateDistributionPresetForm.tsx";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";
import {fetchDistributionConfigs} from "../api/DistributionConfigApi.ts";

function DisfactPage() {
    const [presetName, setPresetName] = useState<string>("");
    const [distributeConfig, setDistributeConfig] = useState<DistributionConfig[]>([]);

    useEffect(() => {
        async function getDistribConfig(){
            const config = await fetchDistributionConfigs();
            setDistributeConfig(config);
        }
        getDistribConfig();
    }, []);

    return (
        <main>
            <h1>Сторінка Disafact: Налаштування дистрибуції</h1>

            <CreateDistributionPresetForm setPresetName={setPresetName}/>

        </main>
    );
}

export default DisfactPage;