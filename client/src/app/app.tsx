import { HeroUIProvider, ToastProvider } from "@heroui/react";
import NavigationBar from "../components/navigation";
import { Outlet, useHref, useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();

    return (
        <HeroUIProvider navigate={navigate} useHref={useHref} className="h-full">
            <NavigationBar />
            <ToastProvider placement="top-right"/>
            <div className="mx-auto p-4 sm:p-6 w-full max-w-5xl">
                <Outlet />
            </div>
        </HeroUIProvider>
    );
}

export default App;
