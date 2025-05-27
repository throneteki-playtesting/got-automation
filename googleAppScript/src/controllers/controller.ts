import { GASAPI } from "common/models/googleAppScriptAPI.js";
import { Log } from "../cloudLogger.js";
import { CardsController } from "./cardsController.js";
import { FormController } from "./formController.js";
import { ProjectController } from "./projectController.js";
import { ReviewsController } from "./reviewsController.js";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Controller {
    const getActions = {
        cards: CardsController.doGet,
        project: ProjectController.doGet,
        reviews: ReviewsController.doGet,
        form: FormController.doGet
    };
    export function get(e: GoogleAppsScript.Events.DoGet) {
        try {
            const pathInfo = e.pathInfo || "";
            const path = pathInfo.split("/");

            if (path.length < 1) {
                throw Error("No path options given");
            }

            const pathAction = path.shift();
            const action = getActions[pathAction];

            if (!action) {
                throw Error(`"${pathAction}" is not a valid path option`);
            }

            return action(path, e);
        } catch (err) {
            Log.error(`Failed to process request:\n${err}`);
            return sendResponse({
                error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                request: e
            });
        }
    }

    const postActions = {
        cards: CardsController.doPost,
        project: ProjectController.doPost,
        reviews: ReviewsController.doPost,
        form: FormController.doPost
    };
    export function post(e: GoogleAppsScript.Events.DoPost) {
        try {
            const pathInfo = e.pathInfo || "";
            const path = pathInfo.split("/");

            if (path.length < 1) {
                throw Error("No path options given");
            }
            const pathAction = path.shift();
            const action = postActions[pathAction];

            if (!action) {
                throw Error(`"${pathAction}" is not a valid path option`);
            }

            return action(path, e);
        } catch (err) {
            Log.error(`Failed to process request:\n${err}`);
            return sendResponse({
                error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                request: e
            });
        }
    }

    export function sendResponse<T>(resp: GASAPI.Response<T>) {
        return ContentService.createTextOutput(JSON.stringify(resp)).setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e: GoogleAppsScript.Events.DoGet) {
    return Controller.get(e);
}
function doPost(e: GoogleAppsScript.Events.DoPost) {
    return Controller.post(e);
}

export {
    Controller,
    doGet,
    doPost
};