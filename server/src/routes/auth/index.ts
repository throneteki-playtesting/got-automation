import { celebrate, Joi, Segments } from "celebrate";
import express from "express";
import asyncHandler from "express-async-handler";
import { dataService, discordService, logger } from "@/services";
import { APIGuildMember, RESTPostOAuth2AccessTokenResult } from "discord.js";
import { User } from "common/models/user";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import { buildUrl } from "common/utils";
import { AuthStatus } from "common/types";

const router = express.Router();

const SCOPES = [
    "identify",
    "guilds",
    "guilds.members.read"
];
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${process.env.DISCORD_AUTH_REDIRECT}&scope=${SCOPES.join("+")}`;
const REDIRECT_URL = `${process.env.CLIENT_HOST}/authRedirect`;

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
        try {
            const { code } = req.query;

            // 1. Get Access Token
            const authToken = await getAuthenticationToken(code);

            // 2. Fetch discord user & member info
            const discordMember = await get<APIGuildMember>(`users/@me/guilds/${discordService.primaryGuild.id}/member`, authToken);
            const discordUser = discordMember.user;
            const discordRoles = await Promise.all(discordMember.roles.map((roleId) => discordService.findRoleById(discordService.primaryGuild, roleId)));

            // 3. Fetch user from database
            let [user] = await dataService.users.read({ discordId: discordUser.id });

            if (!user) {
                user = {
                    discordId: discordUser.id,
                    permissions: [],
                    roles: []
                } as User;
            }
            // 4. Add/Update user data from discord
            user.username = discordUser.username;
            user.displayname = discordMember.nick ?? discordUser.username;
            user.avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
            user.lastLogin = new Date();

            // Fetch and (if missing) save roles
            if (discordRoles.length > 0) {
                const roles = await dataService.roles.read(discordRoles.map(({ name }) => ({ name })));
                const missingRoles = discordRoles.filter(({ id }) => !roles.some((role) => role.discordId === id));
                if (missingRoles.length > 0) {
                    const creating = missingRoles.map(({ id, name }) => ({ discordId: id, name, permissions: [] }));
                    await dataService.roles.create(creating);
                    roles.push(...creating);
                }

                user.roles = roles;
            }

            // 5. Push potential user changes back to database
            await dataService.users.update(user);

            // 6. Create JWT and save as HTTP cookie (so not accessible by JS frontend)
            const jsonWebToken = createJwtFor(user);
            res.cookie("jwt", jsonWebToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            });
            res.redirect(buildUrl(REDIRECT_URL, { status: "success" } as { status: AuthStatus }));
        } catch (err) {
            logger.error(err);
            res.redirect(buildUrl(REDIRECT_URL, { status: "error" } as { status: AuthStatus }));
        }
    })
);

async function getAuthenticationToken(code: string) {
    const response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.DISCORD_AUTH_REDIRECT
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
        `https://discord.com/api/${url}`,
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
    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1h"
    });
}

export default router;