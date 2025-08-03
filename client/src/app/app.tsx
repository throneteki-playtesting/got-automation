import { HeroUIProvider } from "@heroui/react";
import NavigationBar from "../components/navigationBar";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <HeroUIProvider className="bg-default">
            <NavigationBar />
            <div className='container mx-auto'>
                <Outlet />
            </div>
        </HeroUIProvider>
    );
}

export default App;
