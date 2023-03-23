const express = require('express');
const jsonServer = require('json-server');
const Employee = require('../models/employee');
const cacheResponse = require('../services/cache-response');

const router = express.Router();
const db = jsonServer.router('db.json').db;

// Get all employees
router.get('/', (req, res) => {
    res.json(db.get('employees').value());
});

// Get employee by ID
router.get('/:id', cacheResponse(60), (req, res) => {
    const employee = db.get('employees').find({ id: parseInt(req.params.id) }).value();
    if (!employee) {
        return res.status(404).send('Employee not found');
    }

    res.json(employee);
});

// Create employee
router.post('/', (req, res) => {
    const employee = new Employee(Date.now(), req.body.employer_id || null, req.body.name, req.body.email);
    db.get('employees').push(employee).write();
    res.json(employee);
});

// Update employee
router.put('/:id', (req, res) => {
    const employee = db.get('employees').find({ id: parseInt(req.params.id) }).value();
    if (!employee) {
        return res.status(404).send('Employee not found');
    }
    employee.employer_id = req.body.employer_id;
    employee.name = req.body.name;
    employee.email = req.body.email;
    db.get('employees').write();
    res.json(employee);
});

// Delete employee
router.delete('/:id', (req, res) => {
    const employee = db.get('employees').find({ id: parseInt(req.params.id) }).value();
    if (!employee) {
        return res.status(404).send('Employee not found');
    }

    db.get('employees').remove({ id: parseInt(req.params.id) }).write();

    res.send('Employee deleted successfully');
});

module.exports = router;