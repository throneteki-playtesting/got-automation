import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import j2s from "joi-to-swagger";
import * as Schemas from "@/data/schemas";


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
            openapi: "3.0.3",
            info: {
                title: "GOT Automation API",
                description: "Automation for the Global Operations Team for the Game of Thrones Card Game LCG 2nd edition Community",
                version: apiVersion
            },
            servers: [ { url: "http://localhost:8080/api/v1" }],
            consumes: [ "application/json" ],
            produces: [ "application/json" ],
            components: {
                schemas: {
                    card: {
                        body: j2s(Schemas.Card.Body).swagger,
                        query: j2s(Schemas.Card.Query).swagger
                    },
                    playtestingCard: {
                        body: j2s(Schemas.PlaytestingCard.Body).swagger,
                        query: j2s(Schemas.PlaytestingCard.Query).swagger
                    },
                    project: {
                        body: j2s(Schemas.Project.Body).swagger
                    },
                    review: {
                        body: j2s(Schemas.PlaytestingReview.Body).swagger
                    }
                }
            },
            tags: [
                { name: "cards", description: "Create, add and update cards" },
                { name: "projects", description: "Manage projects" },
                { name: "reviews", description: "Manage playtesting reviews of cards" },
                { name: "packs", description: "Generate card packs for json data repository" },
                { name: "custom", description: "Generate custom cards, unrelated to existing projects" }
            ]
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