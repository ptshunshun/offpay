var express = require('express');
var router = express.Router();
const pool = require('../middlewares/database.js');

router.get('/', (req, res, next) => {
  res.redirect('/history');
});

module.exports = router;
