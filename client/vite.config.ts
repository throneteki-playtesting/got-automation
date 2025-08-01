import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        tsconfigPaths()
    ],
    server: {
        proxy: {
            "/api/v1": {
                target: "http://localhost:8080",
                changeOrigin: true
            }
        }
    }
});
