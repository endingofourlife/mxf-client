import axios from "axios";

export const api = axios.create({
    baseURL: "https://calc-api-1-f4gcz72myy.replit.app/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});