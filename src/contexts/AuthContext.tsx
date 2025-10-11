// contexts/AuthContext.tsx
import React, {createContext, useContext, useState, useEffect, type ReactNode} from "react";
import {getToken, setToken, removeToken} from "../utils/token";
import {parseJwt} from "../utils/jwt";

interface User {
    id: string;
    is_superuser: boolean;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [token, setAuthToken] = useState<string | null>(getToken());
    const [user, setUser] = useState<User | null>(null);

    const login = (newToken: string) => {
        setAuthToken(newToken);
        setToken(newToken);
        const payload = parseJwt(newToken);
        if (payload) {
            setUser({
                id: payload.sub,
                is_superuser: payload.is_superuser,
            });
        }
    };

    const logout = () => {
        setAuthToken(null);
        removeToken();
        setUser(null);
    };

    useEffect(() => {
        const existing = getToken();
        if (existing) {
            const payload = parseJwt(existing);
            if (payload) {
                setAuthToken(existing);
                setUser({
                    id: payload.sub,
                    is_superuser: payload.is_superuser,
                });
            }
        }
        console.log('useEffect in AuthProvider ran');
    }, []);

    return (
        <AuthContext.Provider value={{token, user, login, logout, isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
