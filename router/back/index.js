const express = require('express');
const path = require('path');
const router = express.Router();

const staticDir = path.join(__dirname, '../../admin');
console.log(staticDir);
router.use('/', express.static(staticDir));


module.exports = router;
