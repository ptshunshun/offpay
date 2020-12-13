var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('aggregate', { title: 'calc' });
});

module.exports = router;
