import { createBrowserRouter } from "react-router-dom";
import Cards from "./pages/cards";
import App from "./app/app";
import Suggestions from "./pages/suggestions";
import Card from "./pages/card";

const router = createBrowserRouter([
    {
        element: <App />,
        children: [
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