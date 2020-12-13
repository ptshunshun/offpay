var express = require('express');
var router = express.Router();
const database = require('../middlewares/database');
const db = database.createClient();

/* GET home page. */
router.get('/', function(req, res, next) {
  db.query(
    'SELECT * FROM users',
    (error, results) => {
      console.log(results);
      res.render('index', { title: 'calc' });
    }
  )
});

module.exports = router;
