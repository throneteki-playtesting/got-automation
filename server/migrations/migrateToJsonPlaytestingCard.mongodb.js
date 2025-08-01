const database = "gotautomation";
const collection = "cards";

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

const cards = db.getCollection(collection);

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

    // 5. Replace _id with new ObjectId
    const newId = new ObjectId();

    // 6. Apply update
    cards.deleteOne({ _id: card._id });
    const { project, ...other } = card;
    cards.insertOne({
        project,
        ...other,
        _id: newId
    });
});

cards.createIndex({ project: 1, version: 1, number: 1 });