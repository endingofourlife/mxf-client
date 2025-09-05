import {useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import styles from "./EnginePriceCalculator.module.css";
import type {CalculationProcessData} from "../pages/EnginePage.tsx";

interface EnginePriceCalculatorProps {
    realObject: RealEstateObject | null;
    selectedEngine: string;
    setCalculationProcessData: (data: CalculationProcessData) => void;
}

function EnginePriceCalculator({ realObject, selectedEngine, setCalculationProcessData }: EnginePriceCalculatorProps) {
    const [calculatedPrice, setCalculatedPrice] = useState<number | string>(0);

    function onCalculatePrice(normContributeRT: number = 0){
        if (!realObject) {
            setCalculatedPrice("N/A");
            return;
        }

        const basePrice = realObject?.income_plans[0]?.price_per_sqm ?? 0;
        console.log(`Base Price per Square Meter: ${basePrice.toFixed(2)}`);

        const minLiqRate = realObject?.pricing_configs[0]?.content?.staticConfig?.minimum_liq_refusal_price ?? 0;
        console.log(`Minimum Liquidation Refusal Price: ${minLiqRate.toFixed(2)}`);

        const maxLiqRate = realObject?.pricing_configs[0]?.content?.staticConfig?.maximum_liq_refusal_price ?? 0;
        console.log(`Maximum Liquidation Refusal Price: ${maxLiqRate.toFixed(2)}`);

        const minPrice = basePrice * minLiqRate;
        console.log(`Calculated Minimum Price: ${minPrice.toFixed(2)}`);

        const maxPrice = basePrice * maxLiqRate;
        console.log(`Calculated Maximum Price: ${maxPrice.toFixed(2)}`);

        const onBoardingSpread = (maxLiqRate / (minLiqRate || 1e-10)) - 1 || 0;
        console.log(`Onboarding Spread: ${onBoardingSpread.toFixed(4)}`);

        const compensationRate = normContributeRT / (onBoardingSpread || 1e-10) || 0;
        console.log(`Compensation Rate: ${compensationRate.toFixed(4)}`);

        const conditionalValue = 1 + (normContributeRT / (compensationRate || 1e-10)) || 0;
        console.log(`Conditional Value: ${conditionalValue.toFixed(4)}`);

        let price = basePrice * conditionalValue;
        if (selectedEngine === "Oh, Elon") {
            price = basePrice + conditionalValue * (1 + (realObject?.pricing_configs[0].content.staticConfig.maxify_factor || 0)) * (1 + (realObject?.pricing_configs[0].content.staticConfig.overestimate_correct_factor || 0) * 2);
        } else if (selectedEngine === "Regular") {
            price = basePrice * conditionalValue * (1 - (realObject.pricing_configs[0].content.staticConfig.bargainGap) || 0 / 100);
        }
        price = Math.max(price, minPrice);
        price = Math.min(price, maxPrice || Infinity);

        setCalculationProcessData({
            onBoardingSpread,
            compensationRate,
            conditionalValue
        })
        setCalculatedPrice(price ? price.toFixed(2) : "N/A");
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Результат розрахованої ціни на {selectedEngine} engine</h2>

            <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Ціна за м²:</span>
                <span className={styles.priceValue}>{calculatedPrice} ₴</span>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Базовий двигун:</span>
                    <span className={styles.infoValue}>{selectedEngine}</span>
                </div>
                {realObject && (
                    <>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Базова ціна:</span>
                            <span className={styles.infoValue}>
                                {realObject.income_plans[0]?.price_per_sqm?.toFixed(2) || '0.00'} ₴
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Мін. ліквідність:</span>
                            <span className={styles.infoValue}>
                                {realObject.pricing_configs[0]?.content.staticConfig.minimum_liq_refusal_price?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Макс. ліквідність:</span>
                            <span className={styles.infoValue}>
                                {realObject.pricing_configs[0]?.content.staticConfig.maximum_liq_refusal_price?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <button onClick={() => onCalculatePrice()} className={styles.calculateButton}>
                Розрахувати ціну
            </button>
        </section>
    );
}

export default EnginePriceCalculator;