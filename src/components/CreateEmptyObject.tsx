import {type FormEvent, useState} from "react";

interface CreateEmptyObjectProps {
    onCreate: (name: string) => void;
}

function CreateEmptyObject({onCreate}: CreateEmptyObjectProps) {
    const [name, setName] = useState("Новий об'єкт");

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onCreate(name);
    }

    return (
        <form onSubmit={handleSubmit}>
            <p>
                <label htmlFor="name">Введіть ім'я</label>
                <input type="text"
                       id="name"
                       name="name"
                       placeholder="Новий об'єкт"
                       onChange={(e) => setName(e.target.value)}
                />
            </p>
            <button type="submit">Створити</button>
        </form>
    );
}

export default CreateEmptyObject;
