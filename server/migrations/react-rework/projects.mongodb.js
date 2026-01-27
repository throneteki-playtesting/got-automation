/* eslint-disable react-hooks/rules-of-hooks */
const database = "gotautomation";

use(database);

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