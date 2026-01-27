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