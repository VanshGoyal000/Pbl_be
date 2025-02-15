const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;