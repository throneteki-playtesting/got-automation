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
    // 1. Faction mapping
    if (card.faction && factionMap[card.faction]) {
        card.faction = factionMap[card.faction];
    }

    // 2. Lowercase type
    if (card.type) {
        card.type = card.type.toLowerCase();
    }

    // 3. Lowercase note.type
    if (card.note?.type) {
        card.note.type = card.note.type.toLowerCase();
        delete card["note.type"];
    }

    // 4. Rename projectId to project
    if (card.projectId) {
        card.project = card.projectId;
        delete card.projectId;
    }

    // 5. Clean \r from card text
    if (card.text) {
        card.text = card.text.replace("\r", "");
    }

    // 6. Replace _id with new ObjectId
    const newId = new ObjectId();

    // 7. Apply update
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
    // 1. Add number as code
    project.number = project.code;

    // 2. Set code to short
    project.code = project.short;
    delete project.short;

    // 3. Lowercase type
    project.type = project.type.toLowerCase();

    // 4. Set version to releases
    project.version = project.releases;
    delete project.releases;

    // 5. Set created/updated epoch
    project.created = project.updated = new Date();

    // 6. Add new fields
    project.draft = false;

    // 7. Replace _id with new ObjectId
    const newId = new ObjectId();

    // 8. Apply update
    projects.deleteOne({ _id: project._id });
    projects.insertOne({
        ...project,
        _id: newId
    });
});

projects.createIndex({ number: 1 }, { unique: true });


const reviews = db.getCollection("reviews");

reviews.find({}).forEach(review => {
    // 1. Replace projectId with project
    review.project = review.projectId;
    delete review.projectId;

    // 2. Replace epoch with created/updated
    review.created = new Date(review.epoch);
    review.updated = new Date(review.epoch);
    delete review.epoch;

    // 3. Remove unnecessary properties;
    delete review.faction;
    delete review.name;

    // 4. Replace _id with new ObjectId
    const newId = new ObjectId();

    // 5. Apply update
    reviews.deleteOne({ _id: review._id });
    reviews.insertOne({
        ...review,
        _id: newId
    });
});

reviews.createIndex({ reviewer: 1, project: 1, number: 1, version: 1 }, { unique: true });