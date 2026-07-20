const express = require('express');
const router = express.Router();
const chat = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.post('/message', chat.sendMessage);
router.get('/sessions', chat.getSessions);
router.get('/sessions/:id', chat.getSession);
router.delete('/sessions/:id', chat.deleteSession);

module.exports = router;
