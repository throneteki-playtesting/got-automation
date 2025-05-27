import { API } from "./API";
import { Log } from "./cloudLogger";
import { GooglePropertiesType, Settings } from "./settings";
import { DataSheet } from "./spreadsheets/dataSheets";
import { Trigger } from "./spreadsheets/listeners";


// Simple Triggers (does not need additional setup)
global.onOpen = (e: GoogleAppsScript.Events.SheetsOnOpen) => {
    return Trigger.open(e);
};
///////////////////////////////////////////////////
// Complex Triggers (requires setup on Apps Script end)
global.onEdited = (e: GoogleAppsScript.Events.SheetsOnEdit) => {
    return Trigger.edit(e);
};
global.onFormSubmit = (e: GoogleAppsScript.Events.FormsOnFormSubmit) => {
    return Trigger.submit(e);
};
///////////////////////////////////////////////////

// Runnable functions
global.initialiseProject = () => {
    // Setup complex triggers (only if not already existing)
    const existing = ScriptApp.getProjectTriggers();
    if (!existing.some((trigger) => trigger.getHandlerFunction() === "onFormSubmit")) {
        ScriptApp.newTrigger("onFormSubmit")
            .forForm(Settings.getProperty(GooglePropertiesType.Script, "formId"))
            .onFormSubmit()
            .create();
    }
    if (!existing.some((trigger) => trigger.getHandlerFunction() === "onEdited") && SpreadsheetApp.getActiveSpreadsheet()) {
        ScriptApp.newTrigger("onEdited")
            .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
            .onEdit()
            .create();
    }
    return API.postProjectDetails();
};
global.setAPIKey = () => {
    return API.setAPIKey();
};

global.processPendingEdits = () => {
    for (const sheet of Object.values(DataSheet.sheets)) {
        Log.information(`Manually processing pending edits for ${sheet.sheet.getName()}...`);
        sheet.processPendingEdits();
    }
};

global.processAllLatest = () => {
    Log.information("Manually processing all latest...");
    DataSheet.sheets.latest.processAll();
};