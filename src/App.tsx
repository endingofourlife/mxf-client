import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import ConfigurePage from "./pages/ConfigurePage.tsx";
import EnginePage from "./pages/EnginePage.tsx";
import {ActiveRealEstateObjectProvider} from "./contexts/ActiveRealEstateObjectContext.tsx";
import styles from './App.module.css';
import DisfactPage from "./pages/DisfactPage.tsx";

function App() {

  return (
      <div className={styles.globalContainer}>
        <BrowserRouter>
            <ActiveRealEstateObjectProvider>
                <Routes>
                    <Route path={"/"} element={<MainPage />}/>
                    <Route path={"/onboarding/:id"} element={<OnboardingPage />}/>
                    <Route path={"/configure/:id"} element={<ConfigurePage />}/>
                    <Route path={"/engine/:id"} element={<EnginePage />}/>
                    <Route path={'/disfact/'} element={<DisfactPage />} />
                </Routes>
            </ActiveRealEstateObjectProvider>
        </BrowserRouter>
      </div>
  )
}

export default App
