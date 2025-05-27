import { Controller } from "./controller";
import { Project } from "../settings";
import { Projects } from "common/models/projects";
import { GASAPI } from "common/models/googleAppScriptAPI";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ProjectController {
    export function doGet(path: string[], e: GoogleAppsScript.Events.DoGet) {
        const project = Project.get();
        const response = { request: e, data: { project } } as GASAPI.Response<GASAPI.Project.GetResponse>;
        return Controller.sendResponse(response);
    }

    export function doPost(path: string[], e: GoogleAppsScript.Events.DoPost) {
        const project = JSON.parse(e.postData.contents) as Projects.Model;
        Project.set(project);
        const response = { request: e, data: { project } } as GASAPI.Response<GASAPI.Project.SetResponse>;
        return Controller.sendResponse(response);
    }
}

export {
    ProjectController
};