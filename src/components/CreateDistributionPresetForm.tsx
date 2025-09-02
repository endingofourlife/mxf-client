import React, {type FormEvent, useState} from 'react';
import DistributionDynamicParams from "./DistributionDynamicParams.tsx";

interface CreateDistributionPresetFormProps {
    setPresetName: (name: string) => void;
}

function CreateDistributionPresetForm({ setPresetName }: CreateDistributionPresetFormProps) {
    const distributionFunctions = ["Uniform", "Gaussian", "Bimodal"];
    const [functionName, setFunctionName] = useState("Uniform");

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
    }

    return (
        <section>
            <h2>Створити пресет дистрибуції</h2>
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="preset_name">Назва пресету</label>
                    <input
                        type="text"
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder={"Введіть назву пресету"}
                    />
                </p>
                <p>
                    <label htmlFor="function_type">Тип функції</label>
                    <select
                        name="function_type"
                        id="function_type"
                        value={functionName}
                        onChange={(e) => setFunctionName(e.target.value)}
                    >
                        {distributionFunctions.map((item, index) => (
                            <option value={item} key={index}>
                                {item}
                            </option>
                        ))}
                    </select>
                </p>
                <DistributionDynamicParams functionName={functionName}/>
                <button>Зберегти</button>
            </form>
        </section>
    );
}

export default CreateDistributionPresetForm;