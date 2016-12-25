const express = require('express');
const path = require('path');


const router = express.Router();

const staticDir = path.join(__dirname, '../../admin');
router.use('/', express.static(staticDir));

const auth = require('./auth');
router.use('/', auth);

const api = require('./api');
router.use('/api/', api);

module.exports = router;
