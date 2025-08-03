import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./api/store";

import "./main.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);
