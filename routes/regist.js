var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('regist', { title: 'calc' });
});

module.exports = router;
