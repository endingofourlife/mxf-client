import React, {type FormEvent, useState} from 'react';
import {registerRequest} from "../api/Auth.ts";
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";

interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    async function handleRegistration(e: FormEvent) {
        e.preventDefault();
        const params: RegisterRequest = {
            firstName,
            lastName,
            email,
            password
        };
        const token = await registerRequest(params);
        if (token) {
            login(token);
            navigate('/');
        }
    }

    return (
        <form onSubmit={handleRegistration}>
            <p>
                <label htmlFor="firstname">First Name</label>
                <input
                    id="firstName"
                    type="text"
                    placeholder={'vasya'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </p>
            <p>
                <label htmlFor="lastname">Last Name</label>
                <input
                    id="lastName"
                    type="text"
                    placeholder={'pupkin'}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </p>
            <p>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder={'vasin@gmail.com'}
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
            <button type="submit">Create account</button>
        </form>
    );
}

export default Register;