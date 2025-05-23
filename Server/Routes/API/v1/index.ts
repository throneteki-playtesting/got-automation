import express from "express";
import cards from "./Cards";
import projects from "./Projects";
import packs from "./Packs";
import reviews from "./Reviews";
import render from "./Render";

const router = express.Router();
router.use("/cards", cards);
router.use("/projects", projects);
router.use("/packs", packs);
router.use("/reviews", reviews);
router.use("/render", render);

export default router;