import { openMultiWindow, safelyGetUI } from "./spreadsheets/userInput";
import * as Projects from "common/models/projects";

export enum GooglePropertiesType {
    Script,
    Document,
    User
}

function getPropertiesService(type: GooglePropertiesType) {
    switch (type) {
        case GooglePropertiesType.Script:
            return PropertiesService.getScriptProperties();
        case GooglePropertiesType.Document:
            return PropertiesService.getDocumentProperties();
        case GooglePropertiesType.User:
            return PropertiesService.getUserProperties();
    }
}

export function editProperties(type: GooglePropertiesType) {
    const service = getPropertiesService(type);
    let properties = service.getProperties();
    properties = openMultiWindow(properties, "Edit " + GooglePropertiesType[type] + " Properties");
    if (properties) {
        service.setProperties(properties);
    }
}

export function getProperties(type: GooglePropertiesType) {
    const service = getPropertiesService(type);
    return service.getProperties();
}

export function getProperty(type: GooglePropertiesType, key: string) {
    const service = getPropertiesService(type);
    let value = service.getProperty(key);
    const ui = safelyGetUI();
    if (!value && ui) {
        const response = ui.prompt("Please provide value for " + key + ":");
        value = response.getResponseText();
        service.setProperty(key, value);
    }
    return value;
}

export function setProperty(type: GooglePropertiesType, key: string, value: string | undefined) {
    const service = getPropertiesService(type);
    if (!value) {
        service.deleteProperty(key);
    } else {
        service.setProperty(key, value);
    }
}

export function deleteProperty(type: GooglePropertiesType, key: string) {
    const service = getPropertiesService(type);
    service.deleteProperty(key);
}

// Project Settings
export function getProjectDetails() {
    const releases = getProperty(GooglePropertiesType.Script, "releases");
    const emoji = getProperty(GooglePropertiesType.Script, "emoji");
    const project = {
        active: getProperty(GooglePropertiesType.Script, "active") === "true",
        script: getProperty(GooglePropertiesType.Script, "script"),
        name: getProperty(GooglePropertiesType.Script, "name"),
        short: getProperty(GooglePropertiesType.Script, "short"),
        code: parseInt(getProperty(GooglePropertiesType.Script, "code")),
        type: getProperty(GooglePropertiesType.Script, "type"),
        perFaction: parseInt(getProperty(GooglePropertiesType.Script, "perFaction")),
        neutral: parseInt(getProperty(GooglePropertiesType.Script, "neutral")),
        releases: releases ? parseInt(releases) : 0,
        milestone: parseInt(getProperty(GooglePropertiesType.Script, "milestone")),
        formUrl: getProperty(GooglePropertiesType.Script, "formUrl"),
        emoji: emoji || undefined
    } as Projects.Model;
    return project;
}

export function setProjectDetails(project: Projects.Model) {
    setProperty(GooglePropertiesType.Script, "active", `${project.active}`);
    setProperty(GooglePropertiesType.Script, "script", project.script);
    setProperty(GooglePropertiesType.Script, "name", project.name);
    setProperty(GooglePropertiesType.Script, "short", project.short);
    setProperty(GooglePropertiesType.Script, "code", `${project.code}`);
    setProperty(GooglePropertiesType.Script, "type", project.type);
    setProperty(GooglePropertiesType.Script, "perFaction", `${project.perFaction}`);
    setProperty(GooglePropertiesType.Script, "neutral", `${project.neutral}`);
    setProperty(GooglePropertiesType.Script, "releases", `${project.releases}`);
    setProperty(GooglePropertiesType.Script, "milestone", `${project.milestone}`);
    setProperty(GooglePropertiesType.Script, "formUrl", `${project.formUrl}`);
    if (project.emoji) {
        setProperty(GooglePropertiesType.Script, "emoji", `${project.emoji}`);
    }
}