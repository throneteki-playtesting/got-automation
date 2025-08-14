import { HeroUIProvider, ToastProvider } from "@heroui/react";
import NavigationBar from "../components/navigationBar";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <HeroUIProvider>
            <NavigationBar />
            <ToastProvider placement="top-right"/>
            <div className="container">
                <Outlet />
            </div>
        </HeroUIProvider>
    );
}

export default App;
