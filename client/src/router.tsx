import { createBrowserRouter } from "react-router-dom";
import App from "./app/app";
import Cards from "./pages/cards";
import Card from "./pages/card";
import Suggestions from "./pages/suggestions";
import Home from "./pages/home";
import Error from "./components/error";
import Users from "./pages/admin/users";
import Page from "./pages/page";
import { Permission } from "common/models/user";
import Roles from "./pages/admin/roles";
import AuthRedirect from "./pages/authRedirect";

const router = createBrowserRouter([
    {
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
                element: <Page><Home /></Page>
            },
            {
                path: "/authRedirect",
                element: <AuthRedirect />
            },
            {
                path: "/users",
                element: <Page required={Permission.READ_USERS}><Users /></Page>
            },
            {
                path: "/roles",
                element: <Page required={Permission.READ_ROLES}><Roles /></Page>
            },
            {
                path: "/cards",
                element: <Page required={Permission.READ_CARDS}><Cards /></Page>
            },
            {
                path: "/cards/:project/:number",
                element: <Page required={Permission.READ_CARDS}><Card /></Page>
            },
            {
                path: "/suggestions",
                element: <Page required={Permission.SUGGEST_CARDS}><Suggestions /></Page>
            }
        ]
    }
]);

export default router;