import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "./app/app";
import Error from "./components/error";
import Page from "./pages/page";
import { isPageItem, NavItem, navItems } from "./pages";
import Render from "./pages/render";

const router = createBrowserRouter([
    {
        path: "/render",
        element: <Render />
    },
    {
        element: <App />,
        errorElement: <Error content="An unknown error has occured. Please contact administrator." />,
        children: pageItemRoutes()
    }
]);

function pageItemRoutes() {
    const routes: RouteObject[] = [];
    const addRoute = (item: NavItem) => {
        if (isPageItem(item)) {
            routes.push({
                path: item.path,
                element: item.element ? <Page required={item.permission}>{item.element}</Page> : null
            });
        } else {
            item.subPages.forEach(addRoute);
        }
    };

    navItems.forEach(addRoute);
    return routes;
}

export default router;