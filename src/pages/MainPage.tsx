import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {RealEstateObject} from "../interfaces/RealEstateObject.ts";
import {createRealEstateObject, deleteRealEstateObject, fetchRealEstateObjects} from "../api/RealEstateObjectApi.ts";
import ShowObjectItem from "../components/ShowObjectItem.tsx";
import CreateEmptyObject from "../components/CreateEmptyObject.tsx";

function MainPage() {
    const [objects, setObjects] = useState<RealEstateObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    // Fetch real estate objects
    useEffect(() => {
        async function loadObjects() {
            try {
                const data = await fetchRealEstateObjects();
                setObjects(data);
            } catch (error) {
                console.error("Error fetching real estate objects:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadObjects();
    }, []);

    // create a new empty object
    async function handleCreateObject(name: string) {
        try {
            const newObject = await createRealEstateObject(name || "Новий об'єкт");
            setObjects(prevObjects => [...prevObjects, newObject]);
            navigate('/onboarding/' + newObject.id);
        } catch (error) {
            console.error("Error creating real estate object:", error);
        }
    }

    // Delete an object by ID
    async function handleDeleteObject(objId: number) {
        setIsLoading(true);
        try {
            // TODO: add errors handling
            await deleteRealEstateObject(objId);
            setObjects(prevObjects => prevObjects.filter(obj => obj.id !== objId));
        } catch (error) {
            console.error("Error deleting real estate object:", error);
            alert('Не вдалося видалити об\'єкт. Спробуйте ще раз пізніше.');
        } finally {
            setIsLoading(false);
        }
    }

    // Navigate to onboarding page for the object by ID
    function handleObjectClick(objId: number){
        navigate('/onboarding/' + objId);
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <main>
            <h1>Main Page</h1>
            <section>
                <h2>Добавити новий об'єкт</h2>
                <CreateEmptyObject
                    onCreate={handleCreateObject}
                />
            </section>
            <section>
                <h2>Список об'єктів</h2>

                {objects.length === 0 && <p>Об'єкти відсутні. Додайте новий.</p>}

                {objects.map(item => (
                    <ShowObjectItem key={item.id}
                                    {...item}
                                    onClick={handleObjectClick}
                                    onDelete={handleDeleteObject}
                    />
                ))}
            </section>
        </main>
    );
}

export default MainPage;