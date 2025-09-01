import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {fetchRealEstateObject} from "../api/RealEstateObjectApi.ts";
import EditRealEstateObject from "../components/EditRealEstateObject.tsx";
import UploadSpecificationFile from "../components/UploadSpecificationFile.tsx";
import type {RealEstateObjectData} from "../interfaces/RealEstateObjectData.ts";
import { updatePremisesBulk } from "../api/PremisesApi.ts";
import {transformToIncomePlanCreateRequest, transformToPremisesCreateRequest} from "../core/Mappers.ts";
import UploadIncomeFile from "../components/UploadIncomeFile.tsx";
import type {IncomePlanData} from "../interfaces/IncomePlanData.ts";
import { updateIncomePlanBulk } from "../api/IncomePlanApi.ts";
import {useActiveRealEstateObject} from "../contexts/ActiveRealEstateObjectContext.tsx";

function OnboardingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {activeObject, setActiveObject, isLoading, setIsLoading} = useActiveRealEstateObject();

    const [isEditMode, setIsEditMode] = useState(false);

    const [isSpecPreview, setIsSpecPreview] = useState(false);
    const [previewSpecData, setPreviewSpecData] = useState<RealEstateObjectData[]>([]);

    const [isIncomePreview, setIsIncomePreview] = useState(false);
    const [previewIncomeData, setPreviewIncomeData] = useState<IncomePlanData[]>([]);

    // Fetch real estate object data
    useEffect(() => {
        async function getObjectData(objId: number){
           try {
                const response = await fetchRealEstateObject(objId);
                setActiveObject(response);
           } catch (error) {
                console.error("Error fetching real estate object:", error);
                alert('Не вдалося завантажити дані об\'єкта.');
           } finally {
               setIsLoading(false);
           }
        }
        if (activeObject && activeObject.id === Number(id)){
            setIsLoading(false);
            return;
        }
        getObjectData(Number(id));
    }, [id, activeObject, setActiveObject, setIsLoading]);

    // Save uploaded specification data to the API
    async function saveSpecificationData(){
        try {
            const transformedData = transformToPremisesCreateRequest(previewSpecData, Number(id));
            const response = await updatePremisesBulk(transformedData);
            console.log('Successfully saved specification data:', response);
        } catch (error) {
            console.error('Error saving specification data:', error);
            alert('Не вдалося зберегти дані специфікації.');
        }
    }

    // Save uploaded income plan data to the API
    async function saveIncomePlanData(){
        try {
            const transformedData = transformToIncomePlanCreateRequest(previewIncomeData, Number(id));
            const response = await updateIncomePlanBulk(transformedData);
            console.log('Saving income plan data:', response);
        } catch (error) {
            console.error('Error saving income plan data:', error);
            alert('Не вдалося зберегти дані плану доходів.');
        }
    }


    if (!id || !activeObject || !activeObject.id || isLoading) {
        return <p>Загрузка</p>;
    }

    return (
        <main>
            <h1>OnboardingPage</h1>

            {/* Edit Object Section */}
            <section>
                {isEditMode ? (<>
                    <EditRealEstateObject {...activeObject} setIsEditMode={setIsEditMode} />
                </>) : (
                    <p>
                        {activeObject?.name}
                        <button onClick={() => setIsEditMode(true)}>
                            Редагувати
                        </button>
                    </p>
                )}
            </section>

            {/* Upload Specification Section */}
            <UploadSpecificationFile isPreview={isSpecPreview}
                                     setIsPreview={setIsSpecPreview}
                                     previewSpecData={previewSpecData}
                                     setPreviewSpecData={setPreviewSpecData}
            />
            <button onClick={saveSpecificationData}>Save Specification File</button>

            {/* Upload Income Plans Section */}
            <UploadIncomeFile isPreview={isIncomePreview}
                              previewIncomeData={previewIncomeData}
                              setIsPreview={setIsIncomePreview}
                              setPreviewIncomeData={setPreviewIncomeData} />
            <button onClick={saveIncomePlanData}>Save income plan file</button>

            <button onClick={() => {
                navigate("/configure/" + activeObject.id);
            }}>Перейти на конфіг</button>
        </main>
    );
}

export default OnboardingPage;