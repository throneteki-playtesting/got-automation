/* eslint-disable react-hooks/rules-of-hooks */
const database = "gotautomation";

use(database);

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