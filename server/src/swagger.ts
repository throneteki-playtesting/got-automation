import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import j2s from "joi-to-swagger";
import Card from "@/data/models/card";
import Project from "./data/models/project";
import Review from "./data/models/review";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Read all API versions based on folder structure in routes/API
const apiBasePath = path.join(__dirname, "routes", "API");
const apiVersions = fs.readdirSync(apiBasePath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

// Set up spec for each API version
apiVersions.forEach((apiVersion) => {
    const spec = swaggerJSDoc({
        definition: {
            openapi: "3.0.0",
            info: {
                title: `GOT Automation API ${apiVersion}`,
                version: apiVersion.replace(/^v/, "")
            },
            components: {
                schemas: {
                    Card: j2s(Card.schema).swagger,
                    PlaytestingCard: j2s(Card.playtestingSchema).swagger,
                    Project: j2s(Project.schema).swagger,
                    Review: j2s(Review.schema).swagger
                }
            }
        },
        apis: [path.join(apiBasePath, apiVersion, "**", "*.ts")]
    });

    router.use(
        `/api-docs/${apiVersion}`,
        swaggerUi.serve,
        swaggerUi.setup(spec)
    );
});

export default router;