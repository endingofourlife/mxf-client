import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import type {PremisesCreateRequest} from "../api/PremisesApi.ts";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";
import type {IncomePlanCreateRequest} from "../api/IncomePlanApi.ts";

export function transformToPremisesCreateRequest (data: RealEstateObjectData[], reoId: number): PremisesCreateRequest[] {
    return data.map((item) => ({
        reo_id: reoId,
        property_type: item['Property type'] ?? '', // Provide default if undefined
        premises_id: String(item['Premises ID'] ?? ''), // Convert to string
        number_of_unit: Number(item['Number of unit'] ?? 0), // Convert to number
        number: Number(item.Number ?? 0), // Convert to number
        entrance: String(item.Entrance ?? ''), // Convert to string
        floor: Number(item.Floor ?? 0), // Convert to number
        layout_type: item['Layout type'] ?? '', // Provide default if undefined
        full_price: item['Full price'], // Optional, no default needed
        total_area_m2: Number(item['Total area, m2']), // Convert to number
        estimated_area_m2: Number(item['Estimated area, m2']), // Convert to number
        price_per_meter: Number(item['Price per meter']), // Convert to number
        number_of_rooms: Number(item['Number of rooms']), // Convert to number
        living_area_m2: item['Living area, m2'], // Optional, no default needed
        kitchen_area_m2: item['Kitchen area, m2'], // Optional, no default needed
        view_from_window: item['View from window'], // Optional, no default needed
        number_of_levels: item['Number of levels'], // Optional, no default needed
        number_of_loggias: item['Number of loggias'], // Optional, no default needed
        number_of_balconies: item['Number of balconies'], // Optional, no default needed
        number_of_bathrooms_with_toilets: item['Number of bathrooms with toilets'], // Optional
        number_of_separate_bathrooms: item['Number of separate bathrooms'], // Optional
        number_of_terraces: item['Number of terraces'], // Optional
        studio: Boolean(item.Studio ?? false), // Convert to boolean
        status: item.Status ?? '', // Provide default if undefined
        sales_amount: item['Sales amount'], // Optional, no default needed
        customcontent: item.custom_fields, // Map custom_fields to customcontent
    }));
}

export function transformToIncomePlanCreateRequest(data: IncomePlanData[], reoId: number): IncomePlanCreateRequest[] {
    return data.map((item) => ({
        reo_id: reoId,
        property_type: item['Property type'] ?? '', // Provide default if undefined
        period_begin: String(item['period_begin'] ?? ''), // Convert to string
        period_end: String(item['period_end'] ?? ''), // Convert to string
        area: Number(item.area ?? 0), // Convert to number
        planned_sales_revenue: Number(item.planned_sales_revenue ?? 0), // Convert to number
        price_per_sqm: Number(item.price_per_sqm ?? 0), // Convert to number
        price_per_sqm_end: Number(item.price_per_sqm_end ?? 0), // Convert to number
    }));
}