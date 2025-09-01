import {useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";

interface EnginePriceCalculatorProps {
    realObject: RealEstateObject | null;
    selectedEngine: string;
}

// original formula
// export const calculatePrice = (config, selectedEngine, normContributeRT = 0, normContributeRTSpread = 0, priceModifiers = {}) => {
//   const basePrice = parseFloat(config.current_price_per_sqm) || 0;
//   const minLiqRate = parseFloat(config.minimum_liq_refusal_price_rate) || 0;
//   const maxLiqRate = parseFloat(config.maximum_liq_refusal_price_rate) || 0;
//   const minPrice = basePrice * minLiqRate;
//   const maxPrice = basePrice * maxLiqRate;
//
//   const onboardingSpread = (maxLiqRate / (minLiqRate || 1e-10)) - 1 || 0;
//   const compensationRate = normContributeRTSpread / (onboardingSpread || 1e-10) || 0;
//   const conditionalValue = 1 + (normContributeRT / (compensationRate || 1e-10)) || 0;
//
//   let price = basePrice * conditionalValue;
//   if (selectedEngine === "Oh, Elon") {
//     price = basePrice * conditionalValue * (1 + (priceModifiers.maxify_factor || parseFloat(config.maxify_factor) || 0)) * (1 + (priceModifiers.overestimate_correct_factor || parseFloat(config.overestimate_correct_factor) || 0) * 2);
//   } else if (selectedEngine === "Regular") {
//     price = basePrice * conditionalValue * (1 - (priceModifiers.negotiation_discount || parseFloat(config.negotiation_discount) || 0) / 100);
//   }
//
//   price = Math.max(price, minPrice);
//   price = Math.min(price, maxPrice || Infinity);
//
//   return price ? price.toFixed(2) : "N/A";
// };



function EnginePriceCalculator({ realObject, selectedEngine }: EnginePriceCalculatorProps) {
    const [calculatedPrice, setCalculatedPrice] = useState<number | string>(0);

    function onCalculatePrice(normContributeRT: number = 0){
        if (!realObject) {
            setCalculatedPrice("N/A");
            return;
        }

        const basePrice = realObject?.income_plans[0].price_per_sqm || 0;
        const minLiqRate = realObject?.pricing_configs[0].content.staticConfig.minimum_liq_refusal_price || 0;
        const maxLiqRate = realObject?.pricing_configs[0].content.staticConfig.maximum_liq_refusal_price || 0;
        const minPrice = basePrice * minLiqRate;
        const maxPrice = basePrice * maxLiqRate;

        const onBoardingSpread = (maxLiqRate / (minLiqRate || 1e-10)) - 1 || 0;
        const compensationRate = normContributeRT / (onBoardingSpread || 1e-10) || 0;
        const conditionalValue = 1 + (normContributeRT / (compensationRate || 1e-10)) || 0;

        let price = basePrice * conditionalValue;
        if (selectedEngine === "Oh, Elon") {
            price = basePrice + conditionalValue * (1 + (realObject?.pricing_configs[0].content.staticConfig.maxify_factor || 0)) * (1 + (realObject?.pricing_configs[0].content.staticConfig.overestimate_correct_factor || 0) * 2);
        } else if (selectedEngine === "Regular") {
            price = basePrice * conditionalValue * (1 - (realObject.pricing_configs[0].content.staticConfig.bargainGap) || 0 / 100);
        }
        price = Math.max(price, minPrice);
        price = Math.min(price, maxPrice || Infinity);

        setCalculatedPrice(price ? price.toFixed(2) : "N/A");
    }

    return (
        <section>
            <h2>Результат розрахованої ціни на {selectedEngine} engine</h2>
            <p>Ціна: {calculatedPrice}</p>
            <button onClick={() => onCalculatePrice()}>Розрахувати ціну</button>
        </section>
    );
}

export default EnginePriceCalculator;