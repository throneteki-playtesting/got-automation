import express from "express";
import cards from "./cards";
import projects from "./projects";
import packs from "./packs";
import reviews from "./reviews";
import custom from "./custom";
import { parseFilter } from "./middleware";

const router = express.Router();
router.use("/cards", parseFilter, cards);
router.use("/projects", parseFilter, projects);
router.use("/packs", parseFilter, packs);
router.use("/reviews", parseFilter, reviews);
router.use("/custom", parseFilter, custom);

export default router;