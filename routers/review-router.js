const express = require('express');
const jsonServer = require('json-server');
const Review = require('../models/review');
const cacheResponse = require('../services/cache-response');

const router = express.Router();
const db = jsonServer.router('db.json').db;

// Get all reviews
router.get('/', cacheResponse(30), (req, res) => {
    const reviews = db.get('reviews').value();

    res.json(reviews);
});

// Get review by ID
router.get('/:id', cacheResponse(45), (req, res) => {
    const review = db.get('reviews').find({ id: parseInt(req.params.id) }).value();
    if (!review) {
        return res.status(404).send('Review not found');
    }

    res.json(review);
});

// Get reviews by userId
router.get('/users/:userId', cacheResponse(), (req, res) => {
    const reviews = db.get('reviews').filter({ userId: parseInt(req.params.userId) }).value();
    if (!reviews || reviews.length === 0) {
        return res.status(404).send('No reviews found for the given user');
    }

    res.json(reviews);
});

// Create review
router.post('/', (req, res) => {
    const { userId, content, rating, reviewerId } = req.body;
    if (!userId || !content || !rating || !reviewerId) {
        return res.status(400).send('All fields are required');
    }

    const review = new Review(Date.now(), userId, content, rating, reviewerId);
    db.get('reviews').push(review).write();

    res.status(201).json(review);
});

// Update review
router.put('/:id', (req, res) => {
    const review = db.get('reviews').find({ id: parseInt(req.params.id) }).value();
    if (!review) {
        return res.status(404).send('Review not found');
    }

    const { userId, content, rating, reviewerId } = req.body;
    if (!userId || !content || !rating || !reviewerId) {
        return res.status(400).send('All fields are required');
    }

    review.userId = userId;
    review.content = content;
    review.rating = rating;
    review.reviewerId = reviewerId;

    db.get('reviews').write();

    res.json(review);
});

// Delete review
router.delete('/:id', (req, res) => {
    const review = db.get('reviews').find({ id: parseInt(req.params.id) }).value();
    if (!review) {
        return res.status(404).send('Review not found');
    }

    db.get('reviews').remove({ id: parseInt(req.params.id) }).write();

    res.send('Review deleted successfully');
});

module.exports = router;
