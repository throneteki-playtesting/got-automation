import { Forms } from "../forms/form";
import { DataSheet } from "./dataSheets";
import { UIHelper } from "./userInput";

export class Trigger {
    public static edit(e: GoogleAppsScript.Events.SheetsOnEdit) {
        const sheet = e.range.getSheet();
        const dataSheet = Array.from(Object.values(DataSheet.sheets)).find((ds) => ds.isFor(sheet));
        if (dataSheet) {
            dataSheet.onEdit(e);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static open(e: GoogleAppsScript.Events.SheetsOnOpen) {
        // Add UI (if able)
        const ui = UIHelper.safelyGet();
        if (ui) {
            ui.createMenu("Admin Tools")
                .addItem("Set API key", "setAPIKey")
                .addItem("Initialise/Sync Project", "initialiseProject")
                .addSubMenu(
                    ui.createMenu("Changes/Editing")
                        .addItem("Push spreadsheet changes", "processPendingEdits")
                        .addItem("Push all latest", "processAllLatest")
                )
            //     // .addSubMenu(
            //     //     ui.createMenu("Development")
            //     //         .addSubMenu(
            //     //             ui.createMenu("Finalize Dev Update")
            //     //                 .addItem("1. Sync Github Issues", "finalizeIssues")
            //     //                 .addItem("2. Sync Pull Requests", "finalizePullRequest")
            //     //                 .addItem("3. Generate JSON Data", "openJSONDevDialog")
            //     //                 .addItem("4. Generate Update Notes (Unimplemented)", "openUpdateNotesDialog")
            //     //                 .addItem("5. Archive Cards", "archivePlaytestingUpdateCards")
            //     //                 .addItem("6. Increment Project Version", "incrementProjectVersion")
            //     //         )
            //     //         .addSubMenu(
            //     //             ui.createMenu("Individual Tasks")
            //     //                 .addItem("Generate JSON Data", "openJSONDevDialog")
            //     //                 .addItem("Sync Reviews", "syncReviews")
            //     //                 .addItem("Sync Github Issues", "syncIssues")
            //     //                 .addItem("Sync Pull Requests", "syncPullRequests")
            //     //                 .addItem("Archive Cards", "archivePlaytestingUpdateCards")
            //     //                 .addItem("Update Form Cards", "updateFormCards")
            //     //                 .addItem("Increment Project Version", "incrementProjectVersion")
            //     //                 .addSubMenu(
            //     //                     ui.createMenu("Generate Card Images")
            //     //                         .addItem("All Digital Images (PNG)", "syncDigitalCardImages")
            //     //                         .addItem("Some Digital Images (PNG)", "syncSomeDigitalCardImages")
            //     //                         .addItem("Print Sheet (PDF)", "openPDFSheetsDialog")
            //     //                 )
            //     //                 .addItem("Generate Update Notes", "openUpdateNotesDialog")
            //     //                 .addItem("Test", "testMulti")
            //     //         ).addSubMenu(
            //     //             ui.createMenu("Edit Stored Data")
            //     //                 .addItem("Script Data", "editScriptProperties")
            //     //                 .addItem("Document Data", "editDocumentProperties")
            //     //                 .addItem("User Data", "editUserProperties")
            //     //         )
            //     // )
            //     // .addSubMenu(
            //     //     ui.createMenu("Release Tools")
            //     //         .addItem("Validate & Export JSON", "openJSONReleaseDialog")
            //     // )
            //     // .addSubMenu(
            //     //     ui.createMenu("Config")
            //     //         .addItem("WebApp API Credentials", "updateWebAppCredentials")
            //     // )
                .addToUi();
        }
    }

    public static submit(e: GoogleAppsScript.Events.FormsOnFormSubmit) {
        Forms.submit(e.response);
    }
}