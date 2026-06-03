const express = require('express');
const router = express.Router();
const { getTreatments, addTreatment } = require('../controllers/treatmentsController');

router.get('/', getTreatments);
router.post('/', addTreatment);

module.exports = router;
