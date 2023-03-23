const cache = require('memory-cache');

function cacheResponse(duration = 60) {
    return (req, res, next) => {
        const key = '__express__' + req.originalUrl || req.url;
        const cachedData = cache.get(key);

        if (cachedData) {
            res.set('Content-Type', 'application/json');
            res.send(cachedData);

            return;
        }

        res.originalSend = res.send;
        res.send = (body) => {
            cache.put(key, body, duration * 1000);
            res.originalSend(body);
        };

        next();
    };
}

module.exports = cacheResponse;
