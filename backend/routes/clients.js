const express = require('express');
const router = express.Router();
const { getClients } = require('../controllers/clientsController');

router.get('/', getClients);

module.exports = router;
