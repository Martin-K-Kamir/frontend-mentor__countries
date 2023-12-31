import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import CountriesPage from "./features/countries/CountriesPage.jsx";
import CountryPage from "./features/countries/CountryPage.jsx";
import AlertList from "./features/alert/AlertList.jsx";

function App() {
    return (
        <>
            <Routes>
                <Route element={<Layout />}>
                    <Route
                        path="/"
                        element={<Navigate to="/page/1" replace />}
                    />
                    <Route
                        path="/page/:pageId"
                        index
                        element={<CountriesPage />}
                    />
                    <Route
                        path="/page/:regionId/:pageId"
                        element={<CountriesPage />}
                    />
                    <Route
                        path="/country/:countryId"
                        element={<CountryPage />}
                    />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <AlertList />
        </>
    );
}

export default App;
