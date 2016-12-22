const express = require('express');
const path = require('path');

const auth = require('./auth');

const router = express.Router();

const staticDir = path.join(__dirname, '../../admin');
console.log(staticDir);
router.use('/', express.static(staticDir));

router.use('/', auth);

module.exports = router;
