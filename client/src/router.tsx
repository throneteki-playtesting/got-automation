import { createBrowserRouter } from "react-router-dom";
import Cards from "./pages/cards";
import App from "./app/app";

const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            {
                path: "/cards",
                element: <Cards />
            }
        ]
    }
]);

export default router;