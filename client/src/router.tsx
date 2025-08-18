import { createBrowserRouter } from "react-router-dom";
import App from "./app/app";
import Cards from "./pages/cards";
import Card from "./pages/card";
import Suggestions from "./pages/suggestions";
import Home from "./pages/home";
import Error from "./components/error";
import Admin from "./pages/admin";

const router = createBrowserRouter([
    {
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/admin",
                element: <Admin />
            },
            {
                path: "/cards",
                element: <Cards />
            },
            {
                path: "/cards/:project/:number",
                element: <Card />
            },
            {
                path: "/suggestions",
                element: <Suggestions />
            }
        ]
    }
]);

export default router;