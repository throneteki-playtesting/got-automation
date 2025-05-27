import { dataService, discordService, logger } from "@/services";
import { groupCardHistory } from "../data/repositories/cardsRepository";
import * as Projects from "common/models/projects";
import * as FormController from "gas/controllers/formController";
import GasClient from "@/google/gasClient";

// TODO: Maybe more this into a more clean area; for now, just a floating function is fine
export async function updateFormData(...projectIds: Projects.Id[]) {
    const playtesterRole = await discordService.findRoleByName(discordService.primaryGuild, "Playtesting Team");
    if (!playtesterRole) {
        throw Error(`"Playtesting Team" role is missing from ${discordService.primaryGuild.name}`);
    }
    const reviewers = [...new Set(playtesterRole.members.map((member) => member.nickname || member.displayName).sort())];
    const projects = await dataService.projects.read({ codes: projectIds.length > 0 ? projectIds : undefined });
    for (const project of projects) {
        const cards = await dataService.cards.read({ matchers: [{ projectId: project._id }] });
        const latest = groupCardHistory(cards).map((group) => group.latest);
        const cardNames = latest.map((card) => `${card.number} - ${card.toString()}`);

        const body = JSON.stringify({ reviewers, cards: cardNames });
        const client = new GasClient();
        const response = await client.post<FormController.SetValuesResponse>(`${project.script}/form`, body);
        logger.info(`Successfully updated ${project.name} form data with ${response.cards} cards and ${response.reviewers} reviewers`);
    }
}