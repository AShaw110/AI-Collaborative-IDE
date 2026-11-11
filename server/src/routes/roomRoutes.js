const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/:roomId', roomController.getOrCreateRoom);
router.put('/:roomId', roomController.updateRoom);

module.exports = router;
