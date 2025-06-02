const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/auth.middleware');
const { getStreamToken } = require('../controllers/chatController');

router.use(protectRoute); // Apply protectRoute middleware to all routes in this router
 
router.get('/token', getStreamToken)

module.exports = router;