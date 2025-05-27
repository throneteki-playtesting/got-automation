import express from "express";
import cards from "./cards";
import projects from "./projects";
import packs from "./packs";
import reviews from "./reviews";
import render from "./render";

const router = express.Router();
router.use("/cards", cards);
router.use("/projects", projects);
router.use("/packs", packs);
router.use("/reviews", reviews);
router.use("/render", render);

export default router;