const express = require('express');
const router = express.Router();
const { getControlCamas } = require('../controllers/controlCamasController');

router.get('/', getControlCamas);

module.exports = router;