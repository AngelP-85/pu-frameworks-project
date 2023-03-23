const express = require('express');
const jsonServer = require('json-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const db = jsonServer.router('db.json').db;
const saltRounds = 10;
const secretKey = process.env.SECRET_KEY;

const accessTokenExpiry = 3600; // 1h in seconds
const refreshTokenExpiry = 7 * 24 * 3600; // 7 days in seconds

// Register a new user
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  // Check if user already exists
  const userExists = db.get('users').find({ email: email }).value();
  if (userExists) {
    return res.status(400).send('User already exists');
  }

  // Hash the password and save the user to the database
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send('Error registering user');
    }

    const id = Date.now();
    const user = new User(id, email, hash);
    db.get('users').push(user).write();

    res.status(201).send('User registered successfully');
  });
});

// Login user and return a JWT token
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  // Check if user exists
  const user = db.get('users').find({ email: email }).value();
  if (!user) {
    return res.status(401).send('Invalid email or password');
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).send('Invalid email or password');
    }

    // Create access and refresh tokens
    const accessToken = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: accessTokenExpiry });
    const refreshToken = jwt.sign({ id: user.id }, secretKey);
    const refreshTokenExpiryDate = new Date(Date.now() + refreshTokenExpiry);

    // Store the refresh token in the database
    db.get('refreshTokens')
      .push({
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiryDate,
      })
      .write();

    res.json({
      accessToken,
      expiresIn: accessTokenExpiry,
      refreshToken,
      refreshTokenExpiry: refreshTokenExpiry,
    });
  });
});

// Refresh access token using refresh token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send('Refresh token is required');
  }

  const storedToken = db.get('refreshTokens').find({ token: refreshToken }).value();

  if (!storedToken) {
    return res.status(401).send('Invalid refresh token');
  }

  if (new Date() > storedToken.expiresAt) {
    return res.status(401).send('Refresh token has expired');
  }

  jwt.verify(refreshToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid refresh token');
    }

    const userId = decoded.id;
    const user = db.get('users').find({ id: userId }).value();

    if (!user) {
      return res.status(401).send('Invalid refresh token');
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: accessTokenExpiry });

    res.json({
      accessToken,
      expiresIn: accessTokenExpiry,
    });
  });
});

module.exports = router;
