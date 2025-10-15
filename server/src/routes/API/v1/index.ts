import express from "express";
import users from "./users";
import roles from "./roles";
import cards from "./cards";
import projects from "./projects";
import packs from "./packs";
import reviews from "./reviews";
import render from "./render";
import suggestions from "./suggestions";
import { parseFilter } from "@/middleware/filters";

const router = express.Router();
router.use("/users", parseFilter, users);
router.use("/roles", parseFilter, roles);
router.use("/cards", parseFilter, cards);
router.use("/projects", parseFilter, projects);
router.use("/packs", parseFilter, packs);
router.use("/reviews", parseFilter, reviews);
router.use("/render", parseFilter, render);
router.use("/suggestions", parseFilter, suggestions);

router.post("/login", (req, res) => {
    res.redirect("/auth/discord");
});

router.post("/logout", (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.sendStatus(200);
});

export default router;