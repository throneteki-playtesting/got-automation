import express from "express";
import users from "./users";
import cards from "./cards";
import projects from "./projects";
import packs from "./packs";
import reviews from "./reviews";
import custom from "./custom";
import { parseFilter } from "@/middleware/filters";

const router = express.Router();
router.use("/users", parseFilter, users);
router.use("/cards", parseFilter, cards);
router.use("/projects", parseFilter, projects);
router.use("/packs", parseFilter, packs);
router.use("/reviews", parseFilter, reviews);
router.use("/custom", parseFilter, custom);

router.get("/login", (req, res) => {
    res.json(req["user"]);
});

router.post("/logout", (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.sendStatus(200);
});

export default router;