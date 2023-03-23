class Review {
    constructor(id, userId, content, rating, reviewerId) {
        this.id = id;
        this.userId = userId;
        this.content = content;
        this.rating = rating;
        this.reviewerId = reviewerId;
    }
}

module.exports = Review;
