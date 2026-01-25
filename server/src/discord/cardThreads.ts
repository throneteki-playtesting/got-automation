import { BaseMessageOptions, EmbedBuilder, ForumChannel, ForumThreadChannel, Guild, GuildForumTag, Role, ThreadChannel } from "discord.js";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { emojis, icons, discordify, colors, cardAsAttachment } from "./utilities";
import { fileURLToPath } from "url";
import { dataService, discordService, logger } from "@/services";
import { factions } from "common/models/cards";
import PlaytestingCard from "@/data/models/cards/playtestingCard";
import CardCollection from "common/collections/cardCollection";
import { IProject } from "common/models/projects";

export default class CardThreads {
    public static async sync<T extends PlaytestingCard>(guild: Guild, canCreate: boolean, cards: CardCollection<T>) {
        const created: PlaytestingCard[] = [];
        const updated: PlaytestingCard[] = [];
        const failed: PlaytestingCard[] = [];

        const titleFunc = (card: PlaytestingCard) => `${card.number}. ${card.toString()}`;
        try {
            const projects = await dataService.projects.read(cards.latest.map((card) => ({ number: card.project })));
            const { channel, taggedRole, projectTags, factionTags, latestTag } = await CardThreads.validateGuild(guild, ...projects);

            const findCardThreadFor = async (card: PlaytestingCard) => await discordService.findForumThread(channel, (thread) => thread.appliedTags.some((tag) => projectTags[card.project].id === tag) && thread.name === titleFunc(card));
            const autoArchiveDuration = channel.defaultAutoArchiveDuration;

            // Looping through each card group, we only want to create/update threads for the "latest" version
            for (const card of cards) {
                try {
                    const project = projects.find((p) => p.number === card.project);
                    // Collect card data
                    let thread = await findCardThreadFor(card);
                    const threadTitle = titleFunc(card);
                    const latestTags = [projectTags[card.project].id, factionTags[card.faction].id, latestTag.id];
                    // Collect previous data (if applicable)
                    const previous = cards[card.number][card.playtesting];
                    const previousThread = previous ? await findCardThreadFor(previous) : null;
                    const previousTags = previous ? [projectTags[previous.project].id, factionTags[previous.faction].id] : null;

                    if (!thread) {
                        // Prevent card thread from being created, but warn it was attempted
                        if (!canCreate) {
                            logger.warn(`Card thread missing for ${card.code}, but thread creation not allowed`);
                            continue;
                        }

                        const reason = `Design Team discussion for ${project.code} #${card.number}, ${card.toString()}`;
                        const message = CardThreads.generate(taggedRole, card, previousThread);
                        thread = await channel.threads.create({
                            name: threadTitle,
                            reason,
                            message,
                            appliedTags: latestTags,
                            autoArchiveDuration
                        });

                        // Pin the first message of the newly-created thread
                        const starter = await thread.fetchStarterMessage();
                        await starter.pin();

                        // Update previous thread, if applicable
                        const previousPromise = CardThreads.getPreviousThreadPromise(previousThread, latestTag, previousTags);
                        if (previousPromise) {
                            await previousPromise;
                        }

                        created.push(card);
                    } else {
                        const starter = await thread.fetchStarterMessage();
                        const message = CardThreads.generate(taggedRole, card, previousThread);

                        const promises: Map<string, Promise<unknown>> = new Map();

                        // Update previous thread, if applicable
                        const previousPromise = CardThreads.getPreviousThreadPromise(previousThread, latestTag, previousTags);
                        if (previousPromise) {
                            promises.set("Previous Thread Updated", previousPromise);
                        }

                        // Update title
                        if (thread.name !== threadTitle) {
                            promises.set("Title", thread.setName(threadTitle));
                        }
                        // Update content of starter message
                        // Casting as EmbedBuilder as built message will always be an array of that, but TS does not deem it accurate
                        if (starter.content !== message.content || starter.embeds.some((e, ei) => e.fields.some((f, fi) => (message.embeds[ei] as EmbedBuilder).data.fields[fi].value !== f.value))) {
                            promises.set("Message content", starter.edit(message));
                        }
                        // Update pinned-ness
                        if (!starter.pinned && starter.pinnable) {
                            // Accounting for a possible Discord bug here: for some unknown reason, starter.pin() is causing an exception
                            // to be thrown below at "await thread.setArchived(false)" saying it cannot pin as the thread is archived.
                            // This is happening prior to this promise actually running, but re-fetching the starter message and pinning
                            // that seems to resolve it. Strange, but it works.
                            promises.set("Pinned", thread.fetchStarterMessage().then((msg) => msg.pin()));
                        }
                        // Update tags
                        if (thread.appliedTags.length !== latestTags.length || latestTags.some((lt) => !thread.appliedTags.includes(lt))) {
                            promises.set("Tags", thread.setAppliedTags(latestTags));
                        }
                        // Update auto archive duration
                        if (autoArchiveDuration && thread.autoArchiveDuration !== autoArchiveDuration) {
                            promises.set("Auto Archive Duration", thread.setAutoArchiveDuration(autoArchiveDuration));
                        }

                        if (promises.size > 0) {
                            // If thread is currently archived, unarchive & re-archive before/after adjustments are made
                            if (thread.archived) {
                                await thread.setArchived(false);
                                await Promise.allSettled(promises.values());
                                await thread.setArchived(true);
                            } else {
                                await Promise.allSettled(promises.values());
                            }

                            updated.push(card);
                            logger.verbose(`Updated the following for ${card.code} card thread: ${Array.from(promises.keys()).join(", ")}`);
                        }

                    }
                } catch (err) {
                    logger.error(err);
                    failed.push(card);
                }
            }
        } catch (err) {
            throw Error(`Failed to sync card threads for forum "${guild.name}"`, { cause: err });
        }

        return { created, updated, failed };
    }

    // TODO: Convert this to a generic "editThread" function which automatically wraps the promise chains in "unarchive + archive" promises
    private static getPreviousThreadPromise(thread: ForumThreadChannel, latestTag: GuildForumTag, previousTags: string[]) {
        if (!thread) {
            return null;
        }
        const promises: Promise<unknown>[] = [];
        // Update the tags
        if (thread.appliedTags.includes(latestTag.id)) {
            promises.push(thread.setAppliedTags(previousTags));
        }
        // Lock the thread
        if (!thread.locked) {
            promises.push(thread.setLocked(true));
        }

        // If its not archived, or if any of the above are to happen, archive the thread at the end
        if (!thread.archived || promises.length > 0) {
            promises.push(thread.setArchived(true));
        }

        if (promises.length > 0) {
            // Start with unarchiving if thread is currently archived
            let promise: Promise<unknown> = thread.archived ? thread.setArchived(false) : undefined;
            // Then chain all promises
            for (const p of promises) {
                promise = promise ? promise.then(() => p) : p;
            }

            // Return single promise with all changes chained (and capped by unarchiving & archiving)
            return promise;
        }

        return null;
    }

    private static async validateGuild(guild: Guild, ...projects: IProject[]) {
        const forumName = "card-forum";

        const errors = [];
        // Check forum channel exists
        const channel = guild.channels.cache.find((c) => c instanceof ForumChannel && c.name.endsWith(forumName)) as ForumChannel;
        if (!channel) {
            errors.push(`"${forumName}" channel does not exist or is not a forum`);
        }

        // Check DT role exists
        const taggedRole = await discordService.findRoleByName(guild, "Design Team");
        if (!taggedRole) {
            errors.push("\"Design Team\" role does not exist");
        }

        const projectTags = {} as { [projectId: string]: GuildForumTag };
        for (const project of projects) {
            // Check project tag exists
            const projectTag = channel?.availableTags.find((t) => t.name === project.code);
            if (!projectTag) {
                errors.push(`"${project.code}" tag is missing on forum "${channel?.name}"`);
            } else {
                projectTags[project.code] = projectTag;
            }
        }

        const factionTags = {} as { [faction: string]: GuildForumTag };
        for (const faction of factions) {
            const factionTag = channel?.availableTags.find((t) => t.name === faction);
            if (!factionTag) {
                errors.push(`"${faction}" tag is missing on Forum channel "${channel?.name}"`);
            } else {
                factionTags[faction] = factionTag;
            }
        }

        // Check "latest" tag exists
        const latestTag = channel?.availableTags.find((t) => t.name === "Latest");
        if (!latestTag) {
            errors.push(`"Latest" tag is missing on forum "${channel?.name}"`);
        }

        if (errors.length > 0) {
            throw Error(`Guild validation failed: ${errors.join(", ")}`);
        }

        return { channel, taggedRole, projectTags, factionTags, latestTag };
    }

    private static generate(taggedRole: Role, card: PlaytestingCard, previousThread?: ThreadChannel<true>) {
        // If it's a preview, type as "Preview"
        // If it's either initial or there is no previous thread (meaning it's the 1.0.0 version), then "Initial"
        // Otherwise, note type
        const type = card.isPreview ? "preview" : (card.isInitial ? "initial" : card.note.type);
        const content = CardThreads.renderTemplate({ type, card, project: card.project, previousUrl: previousThread?.url || card.code, role: taggedRole });
        const image = cardAsAttachment(card);
        const allowedMentions = { parse: ["roles"] };
        const changeNote = card.note && card.note.type !== "implemented" ? new EmbedBuilder()
            .setColor(colors[card.faction as string])
            .setTitle(`${emojis["changeNotes"]} Change Notes`)
            .addFields(
                { name: `${emojis[card.note.type]} ${card.note.type}`, value: discordify(card.note.text) }
            ) : undefined;

        return {
            content,
            files: [image],
            allowedMentions,
            ...(changeNote && { embeds: [changeNote] })
        } as BaseMessageOptions;
    }

    private static renderTemplate(data: ejs.Data) {
        const { type, ...restData } = data;
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = `${__dirname}/templates/cardThreads/${type}.ejs`;
        const file = fs.readFileSync(filePath).toString();

        const render = ejs.render(file, { filename: filePath, emojis, icons, ...restData });

        return discordify(render);
    }
}