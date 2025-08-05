import { HeroUIProvider } from "@heroui/react";
import NavigationBar from "../components/navigationBar";
import { Outlet } from "react-router-dom";

function App() {
    return (
        <HeroUIProvider>
            <NavigationBar />
            <div className='container'>
                <Outlet />
            </div>
        </HeroUIProvider>
    );
}

export default App;
