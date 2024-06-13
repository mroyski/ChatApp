const express = require('express');
const { createRoom, getMessages } = require('../controllers/chatController');
const router = express.Router();

router.post('/rooms', createRoom);
router.get('/rooms/:roomId/messages', getMessages);

module.exports = router;
