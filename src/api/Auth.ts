import api from "./BaseApi.ts";


interface LoginRequest{
    email: string;
    password: string;
}

interface RegisterRequest{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface AuthResponse {
    access_token: string;
    token_type: string;
}

export async function loginRequest(params: LoginRequest){
    const {data} = await api.post<AuthResponse>('/user/token', {
        "email": params.email,
        "password": params.password
    });
    return data.access_token;
}

export async function registerRequest(params: RegisterRequest){
    const {data} = await api.post<AuthResponse>('/user/register', {
        "first_name": params.firstName,
        "last_name": params.lastName,
        "email": params.email,
        "password": params.password
    });
    return data.access_token;
}