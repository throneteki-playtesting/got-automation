/* eslint-disable react-hooks/rules-of-hooks */
const database = "gotautomation";

use(database);

const factionMap = {
    "House Baratheon": "baratheon",
    "House Greyjoy": "greyjoy",
    "House Lannister": "lannister",
    "House Martell": "martell",
    "The Night's Watch": "thenightswatch",
    "House Stark": "stark",
    "House Targaryen": "targaryen",
    "House Tyrell": "tyrell",
    "Neutral": "neutral"
};

const cards = db.getCollection("cards");

cards.find({}).forEach(card => {
    // Faction mapping
    if (card.faction && factionMap[card.faction]) {
        card.faction = factionMap[card.faction];
    }

    // Lowercase type
    if (card.type) {
        card.type = card.type.toLowerCase();
    }

    // Lowercase note.type
    if (card.note?.type) {
        card.note.type = card.note.type.toLowerCase();
        delete card["note.type"];
    }

    // Rename projectId to project
    if (card.projectId) {
        card.project = card.projectId;
        delete card.projectId;
    }

    // Clean \r from card text
    if (card.text) {
        card.text = card.text.replace("\r", "");
    }

    // Replace _id with new ObjectId
    const newId = new ObjectId();

    // Apply update
    cards.deleteOne({ _id: card._id });
    const { project, ...other } = card;
    cards.insertOne({
        project,
        ...other,
        _id: newId
    });
});

cards.createIndex({ project: 1, version: 1, number: 1 }, { unique: true });


const projects = db.getCollection("projects");

projects.find({}).forEach(project => {
    // Add number as code
    project.number = project.code;

    // Set code to short
    project.code = project.short;
    delete project.short;

    // Lowercase type
    project.type = project.type.toLowerCase();

    // Set version to releases
    project.version = project.releases;
    delete project.releases;

    // Set created/updated date
    project.created = project.updated = new Date();

    // Add new fields
    project.draft = !project.active;
    project.cardCount = {
        baratheon: project.perFaction,
        greyjoy: project.perFaction,
        lannister: project.perFaction,
        martell: project.perFaction,
        thenightswatch: project.perFaction,
        stark: project.perFaction,
        targaryen: project.perFaction,
        tyrell: project.perFaction,
        neutral: project.neutral
    };
    delete project.perFaction;
    delete project.neutral;

    // Update emoji styling (remove start/end :)
    project.emoji = project.emoji.replaceAll(":", "");

    // Replace _id with new ObjectId
    const newId = new ObjectId();

    // Apply update
    projects.deleteOne({ _id: project._id });
    projects.insertOne({
        ...project,
        _id: newId
    });
});

projects.createIndex({ number: 1 }, { unique: true });


const reviews = db.getCollection("reviews");

reviews.find({}).forEach(review => {
    // Replace projectId with project
    review.project = review.projectId;
    delete review.projectId;

    // Replace epoch with created/updated
    review.created = review.updated = new Date(review.epoch);
    delete review.epoch;

    // Remove unnecessary properties;
    delete review.faction;
    delete review.name;

    // Replace _id with new ObjectId
    const newId = new ObjectId();

    // Apply update
    reviews.deleteOne({ _id: review._id });
    reviews.insertOne({
        ...review,
        _id: newId
    });
});

reviews.createIndex({ reviewer: 1, project: 1, number: 1, version: 1 }, { unique: true });