const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt, getAttempt, getHistory } = require('../controllers/attemptController');

router.post('/', startAttempt);
router.post('/:id/submit', submitAttempt);
router.get('/history', getHistory);
router.get('/:id', getAttempt);

module.exports = router;