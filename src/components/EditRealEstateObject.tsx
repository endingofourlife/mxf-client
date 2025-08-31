import {type FormEvent, useState} from "react";
import {changeRealEstateObject} from "../api/RealEstateObjectApi.ts";

interface EditRealEstateObjectProps {
    id: number;
    name?: string;
    lat?: number;
    lon?: number;
    curr?: string;
    url?: string;
    setIsEditMode: (value: boolean) => void;
}


function EditRealEstateObject({ id, name, lat, lon, curr, url, setIsEditMode }: EditRealEstateObjectProps) {
    const [formName, setFormName] = useState(name || '');
    const [formLat, setFormLat] = useState(lat ?? '');
    const [formLon, setFormLon] = useState(lon ?? '');
    const [formCurr, setFormCurr] = useState(curr || '');
    const [formUrl, setFormUrl] = useState(url || '');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const payload = {
            name: formName,
            lat: parseFloat(formLat as string),
            lon: parseFloat(formLon as string),
            curr: formCurr,
            url: formUrl,
        };
        try {
            await changeRealEstateObject(id, payload.name, payload.lat, payload.lon, false, payload.curr, payload.url, {});
            alert('Об\'єкт успішно оновлено');
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating real estate object:", error);
        }
    }

    return (
        <section>
            <h2>Редагування об'єкта</h2>
            <p>Для редагування внесіть необхідні значення і натисніть "зберегти"</p>
            <button onClick={() => setIsEditMode(false)}>
                Відмінити
            </button>
            <form onSubmit={handleSubmit}>
                <p>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        value={formName}
                        id="name"
                        onChange={(e) => setFormName(e.target.value)}
                    />
                </p>
                <p>
                    <label htmlFor="lat">Latitude</label>
                    <input
                        type="number"
                        value={formLat}
                        id="lat"
                        step="any" // Allow decimal numbers
                        onChange={(e) => setFormLat(e.target.value)}
                    />
                </p>
                <p>
                    <label htmlFor="lon">Longitude</label>
                    <input
                        type="number"
                        value={formLon}
                        id="lon"
                        step="any"
                        onChange={(e) => setFormLon(e.target.value)}
                    />
                </p>
                <p>
                    <label htmlFor="curr">Currency</label>
                    <input
                        type="text"
                        value={formCurr}
                        id="curr"
                        onChange={(e) => setFormCurr(e.target.value)}
                    />
                </p>
                <p>
                    <label htmlFor="url">URL</label>
                    <input
                        type="text"
                        value={formUrl}
                        id="url"
                        onChange={(e) => setFormUrl(e.target.value)}
                    />
                </p>
                <button type="submit">Зберегти</button>
            </form>
        </section>
    );
}

export default EditRealEstateObject;