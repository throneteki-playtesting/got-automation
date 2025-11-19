import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./app/app";
import Error from "./components/error";
import Page from "./pages/page";
import AuthRedirect from "./pages/authRedirect";
import { isPageItem, NavItem, navItems } from "./pages";
import Render from "./pages/render";

const router = createBrowserRouter([
    {
        path: "/render",
        element: <Render />
    },
    {
        element: <App />,
        errorElement: <Error />,
        children: [
            ...pageItemRoutes(),
            {
                path: "/authRedirect",
                element: <AuthRedirect />
            }
        ]
    }
]);

function pageItemRoutes() {
    const routes: RouteObject[] = [];
    const addRoute = (item: NavItem) => {
        if (isPageItem(item)) {
            routes.push({
                path: item.path,
                element: <Page required={item.permission}>{item.element}</Page>
            });
        } else {
            item.subPages.forEach(addRoute);
        }
    };

    navItems.forEach(addRoute);
    return routes;
}

export default router;