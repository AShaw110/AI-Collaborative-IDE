const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

router.post('/', debugController.debugCode);

module.exports = router;
