import config from "config";
import DataService from "@/data";
import DiscordService from "@/discord";
import GithubService from "@/github";
import RenderingService from "@/rendering";
import LoggerService from "@/logger";
import GoogleAppsScriptClient from "@/google/googleAppScriptClient";

export const logger = LoggerService.initialise(config.get("verbose") as boolean);

export const dataService = new DataService(config.get("database.url"));
export const googleAppScriptService = new GoogleAppsScriptClient(config.get("google.clientEmail"), config.get("google.privateKey"));
export const renderService = new RenderingService();
export const discordService = new DiscordService(config.get("discord.token"), config.get("discord.clientId"), config.get("discord.guildId.primary"), config.get("discord.guildId.development"));
export const githubService = new GithubService(config.get("github.owner"), config.get("github.repository"), config.get("github.appId"), config.get("github.privateKey"));