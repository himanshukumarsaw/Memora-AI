const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const { getActivity } = require('../controllers/activity.controller');

router.use(auth);
router.get('/', getActivity);

module.exports = router;
