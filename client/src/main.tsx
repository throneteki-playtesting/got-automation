import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./api/store";

import App from "./app/app";
import "./main.css";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>
);
