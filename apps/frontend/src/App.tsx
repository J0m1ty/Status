import { Route, Routes } from "react-router";
import { Dashboard } from "./routes/Dashboard";
import { Login } from "./routes/Login";
import { Logout } from "./routes/Logout";

export const App = () => {
    return (
        <Routes>
            <Route path="*" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}