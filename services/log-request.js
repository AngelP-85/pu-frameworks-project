const jsonServer = require('json-server');
const db = jsonServer.router('db.json').db;

function logRequest(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const authToken = req.headers.authorization || null;

    const newLog = {
        timestamp,
        method,
        path,
        auth_token: authToken
    };

    db.get('request_logs').push(newLog).write();

    next();
}

module.exports = logRequest;
