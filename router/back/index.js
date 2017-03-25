const Model = require('../../model');
const express = require('express');
const path = require('path');


const router = express.Router();

const staticDir = path.join(__dirname, '../../admin');
router.use('/', express.static(staticDir));

const auth = require('./auth');
router.use('/', auth);

const api = require('./api');
router.use('/api/', api);


router.get('/preview/:articleid', (req, res, next) => {
  Model.Article.findOne({ _id: req.params.articleid })
  .then(article => {
    res.render('article', {
      article: article
    })
  })
  .catch(err => {
    next(err)
  })
})

module.exports = router;
