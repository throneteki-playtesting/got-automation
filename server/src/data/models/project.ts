import { IProject, Type } from "common/models/projects";

class Project implements IProject {
    // octgnId?: string;
    public number: number;
    public name: string;
    public code: string;
    public active: boolean;
    public type: Type;
    public script: string;
    public perFaction: number;
    public neutral: number;
    public version: number;
    public milestone: number;
    public formUrl: string;
    public emoji?: string;
    public created: Date;
    public updated: Date;

    constructor(data: IProject) {
        this.number = data.number;
        this.name = data.name;
        this.code = data.code;
        this.active = data.active;
        this.type = data.type;
        this.script = data.script;
        this.perFaction = data.perFaction;
        this.neutral = data.neutral;
        this.version = data.version;
        this.milestone = data.milestone;
        this.formUrl = data.formUrl;
        this.emoji = data.emoji;
        this.created = data.created;
        this.updated = data.updated;
    }

    clone() {
        const clonedJsonData = {
            number: this.number,
            name: this.name,
            code: this.code,
            active: this.active,
            type: this.type,
            script: this.script,
            perFaction: this.perFaction,
            neutral: this.neutral,
            version: this.version,
            milestone: this.milestone,
            formUrl: this.formUrl,
            emoji: this.emoji,
            created: this.created,
            updated: this.updated
        } as IProject;

        return new Project(clonedJsonData);
    }

    /**
     * Converts card into format appropriate for general JSON
     */
    toJSON() {
        const obj = {
            number: this.number,
            name: this.name,
            code: this.code,
            active: this.active,
            type: this.type,
            script: this.script,
            perFaction: this.perFaction,
            neutral: this.neutral,
            version: this.version,
            milestone: this.milestone,
            formUrl: this.formUrl,
            emoji: this.emoji,
            created: this.created,
            updated: this.updated
        } as IProject;
        return obj;
    }

    toString() {
        return this.name;
    }
}

export default Project;