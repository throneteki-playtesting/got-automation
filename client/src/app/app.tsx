import { Card, HeroUIProvider, ToastProvider } from "@heroui/react";
import NavigationBar from "../components/navigation";
import { Outlet, useHref, useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();

    return (
        <HeroUIProvider navigate={navigate} useHref={useHref} className="h-full">
            <NavigationBar />
            <ToastProvider placement="top-right"/>
            <Card className="container" radius="none">
                <Outlet />
            </Card>
        </HeroUIProvider>
    );
}

export default App;
