import { HeroUIProvider, ToastProvider } from "@heroui/react";
import NavigationBar from "../components/navigation";
import { Outlet, useHref, useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();

    return (
        <HeroUIProvider navigate={navigate} useHref={useHref}>
            <NavigationBar />
            <ToastProvider placement="top-right"/>
            <div className="container">
                <Outlet />
            </div>
        </HeroUIProvider>
    );
}

export default App;
