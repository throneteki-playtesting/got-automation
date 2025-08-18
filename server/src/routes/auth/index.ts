import config from "config";
import { celebrate, Joi, Segments } from "celebrate";
import express from "express";
import asyncHandler from "express-async-handler";
import { dataService, discordService } from "@/services";
import { APIGuildMember, RESTPostOAuth2AccessTokenResult } from "discord.js";
import { Role, User } from "common/models/user";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

const router = express.Router();

// TODO: Move all settings to ENV variables (and access through that instead)
const JWT_SECRET = config.get("jwt") as string;
const GUILD_ID = config.get("discord.guildId.development") as string;
const CLIENT_ID = config.get("discord.clientId") as string;
const CLIENT_SECRET = config.get("discord.clientSecret") as string;
const REDIRECT_URI = config.get("discord.authRedirectUri") as string;
const SCOPES = [
    "identify",
    "guilds",
    "guilds.members.read"
];
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join("+")}`;
const API_BASE_URL = "https://discord.com/api";

router.get("/discord", (req, res) => {
    res.redirect(encodeURI(DISCORD_AUTH_URL));
});

type DiscordCallbackQuery = { code: string };

router.get("/discord/callback",
    celebrate({
        [Segments.QUERY]: {
            code: Joi.string().required()
        }
    }),
    asyncHandler<unknown, unknown, unknown, DiscordCallbackQuery>(async (req, res) => {
        const { code } = req.query;

        // 1. Get Access Token
        const authToken = await getAuthenticationToken(code);

        // 2. Fetch discord user & member info
        const discordMember = await get<APIGuildMember>(`users/@me/guilds/${GUILD_ID}/member`, authToken);
        const discordUser = discordMember.user;
        const roleNames = await Promise.all(discordMember.roles.map((roleId) => discordService.findRoleById(discordService.primaryGuild, roleId)));

        const user = {
            discordId: discordUser.id,
            username: discordUser.username,
            displayname: discordMember.nick ?? discordUser.username,
            avatarUrl: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
            lastLogin: new Date(),
            permissions: [],
            roles: roleNames.map((role) => ({ name: role.name, permissions: [] }) as Role)
        } as User;

        // 3. Fetch user from database
        await dataService.users.update(user);

        // 4. Create JWT and save as HTTP cookie (so not accessible by JS frontend)
        const jsonWebToken = createJwtFor(user);
        res.cookie("jwt", jsonWebToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        // TODO: Update this
        res.redirect("http://localhost:5173/");
    })
);

async function getAuthenticationToken(code: string) {
    const response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch OAuth2 token from Discord: ${response.statusText}`);
    }

    const accessTokenData = await response.json() as RESTPostOAuth2AccessTokenResult;

    return `${accessTokenData.token_type} ${accessTokenData.access_token}`;
}

async function get<T>(url: string, authToken: string) {
    const response = await fetch(
        `${API_BASE_URL}/${url}`,
        { headers: { Authorization: authToken } }
    );
    if (!response.ok) {
        throw new Error(`Failed Discord request: ${response.statusText}`);
    }

    return response.json() as T;
}

function createJwtFor(user: User) {
    const permissions = user.permissions;
    user.roles.forEach((role) => permissions.push(...role.permissions));

    const payload = {
        username: user.username,
        permissions
    } as JWTPayload;
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1h"
    });
}

export default router;