const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, getAvailableSlots } = require('../controllers/appointmentsController');

router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/slots', getAvailableSlots);

module.exports = router;
