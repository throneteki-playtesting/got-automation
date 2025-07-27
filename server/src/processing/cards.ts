import PlaytestingCard from "@/data/models/cards/playtestingCard";
import { dataService, githubService } from "@/services";

/*
 * Finalises cards and projects from a recent playtesting release
 */
export async function finalise(projectNumber: number) {
    const toLatest: PlaytestingCard[] = [];
    const toArchive: PlaytestingCard[] = [];

    const [project] = await dataService.projects.read({ number: projectNumber });
    if (!await githubService.isLatestPRMerged(project)) {
        throw Error(`Playtesting Update ${project.version + 1} PR either does not exist, or is not merged into playtesting branch`);
    }
    const cards = await dataService.cards.read({ project: projectNumber });
    for (const latest of cards) {
        // If card has any sort of change, it must be marked to update and/or archive
        if (latest.isChanged || latest.implementStatus === "recently implemented") {
            if (latest.version !== latest.playtesting) {
                // Set playtesting to version (for both all copies)
                latest.playtesting = latest.version;

                // Clone for archive
                const archive = latest.clone();
                // If was recently implemented, mark archived copy as "complete"
                if (archive.implementStatus === "recently implemented") {
                    archive.github.status = "complete";
                }
                toArchive.push(archive);
            }

            // If card has been implemented, remove the github issue details (for latest only)
            if (latest.implementStatus === "recently implemented") {
                delete latest.github;
            }

            delete latest.note;
            toLatest.push(latest);
        }
    }
    if (toArchive.length > 0) {
        // Archive the current version (with notes, issues, etc.)
        await dataService.cards.database.update(toArchive);
        await dataService.cards.spreadsheet.update(toArchive, { sheets: ["archive"] });
    }
    if (toLatest.length > 0) {
        // Update latest with "cleaned" version
        await dataService.cards.spreadsheet.update(toLatest, { sheets: ["latest"] });

        // Increment project version & update if any were pushed to latest
        project.version++;
        await dataService.projects.update(project);
    }
    return {
        updated: toArchive
    };
}