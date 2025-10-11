import React, {type FormEvent, useState} from 'react';
import {loginRequest} from "../api/Auth.ts";
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

interface LoginRequest {
    email: string;
    password: string;
}

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        const params: LoginRequest = {
            email,
            password
        };
        const token = await loginRequest(params);
        if (token) {
            login(token);
            navigate('/');
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <p>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder={'example@gmail.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </p>
            <p>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </p>
            <button type="submit">Sign in</button>
        </form>
    );
}

export default Login;