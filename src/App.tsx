import {HashRouter, Route, Routes, Navigate} from "react-router-dom";
import MainPage from "./pages/MainPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import ConfigurePage from "./pages/ConfigurePage.tsx";
import EnginePage from "./pages/EnginePage.tsx";
import {ActiveRealEstateObjectProvider} from "./contexts/ActiveRealEstateObjectContext.tsx";
import {AuthProvider, useAuth} from "./contexts/AuthContext.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import DisfactPage from "./pages/DisfactPage.tsx";
import {AdminRoute} from "./components/ProtectedRoute.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import type {ReactNode} from "react";
import Header from "./layout/Header.tsx";

function ProtectedRoute({element}: {element: ReactNode}) {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? element : <Navigate to="/auth" />;
}

function App() {
    return (
        <div>
            <HashRouter>
                <AuthProvider>
                    <ActiveRealEstateObjectProvider>
                        <Header/>
                        <Routes>
                            {/* For everybody */}
                            <Route path="/auth" element={<AuthPage />} />

                            {/* Protected (need log in) */}
                            <Route
                                path="/"
                                element={<ProtectedRoute element={<MainPage />} />}
                            />
                            <Route
                                path="/onboarding/:id"
                                element={<ProtectedRoute element={<OnboardingPage />} />}
                            />
                            <Route
                                path="/configure/:id"
                                element={<ProtectedRoute element={<ConfigurePage />} />}
                            />
                            <Route
                                path="/engine/:id"
                                element={<ProtectedRoute element={<EnginePage />} />}
                            />
                            <Route
                                path="/disfact"
                                element={<ProtectedRoute element={<DisfactPage />} />}
                            />

                            {/* only admin */}
                            <Route
                                path="/admin"
                                element={<AdminRoute element={<AdminPage />} />}
                            />

                            {/* if not found / */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </ActiveRealEstateObjectProvider>
                </AuthProvider>
            </HashRouter>
        </div>
    );
}

export default App;