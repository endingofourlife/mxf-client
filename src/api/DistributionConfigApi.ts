import {api} from "./BaseApi.ts";
import type {DistributionConfig} from "../interfaces/DistributionConfig.ts";

interface CreateDistributionConfigRequest{
    func_name: string;
    content: Record<string, unknown>;
}

export async function createDistributionConfig(config: CreateDistributionConfigRequest){
    const {data} = await api.post("/distribution-configs/", {
        func_name: config.func_name,
        content: config.content
    });
    return data;
}

export async function fetchDistributionConfigs(){
    const {data} = await api.get<DistributionConfig[]>("/distribution-configs/");
    return data;
}