const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function authenticateJWT(publicRoutes = []) {
    return (req, res, next) => {
      if (publicRoutes.includes(req.path)) {
        return next();
      }
  
      const authHeader = req.headers.authorization;
  
      if (authHeader) {
        const token = authHeader.split(' ')[1];
  
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            return res.status(403).send('Invalid or expired token');
          }
  
          req.user = decoded;
  
          next();
        });
      } else {
        res.status(401).send('Authorization header is required');
      }
    };
  }

module.exports = authenticateJWT;
