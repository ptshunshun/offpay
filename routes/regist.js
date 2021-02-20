var express = require('express');
var router = express.Router();
const pool = require('../middlewares/database.js');
const { authorize } = require('../public/lib/accountcontorol.js')
const moment = require('moment');

var validateRegistData = function (body) {
  var isValidated = true, errors = {};

  if (!body.user) {
    isValidated = false;
    errors.url = "URLが未入力です。'/'から始まるURLを入力してください。";
  }

  if (!body.type) {
    isValidated = false;
    errors.title = "タイトルが未入力です。任意のタイトルを入力してください。";
  }

  return isValidated ? undefined : errors;
};

var createRegistData = function (body) {
  return {
    user: body.user,
    type: body.type,
    month: body.month,
    cost: body.cost,
  };
};

router.get("/", authorize('readWrite'), async (req, res) => {
  try {
    const query = 'SELECT * FROM users; SELECT * FROM typeMst;'
    const results = await pool.query(query);

    res.render('./regist/index.ejs', {
      title: 'offpay',
      users: results[0],
      types: results[1],
      moment: moment
    });
  }
  catch (err) {
    console.log(err);
  }
});

router.post('/input', authorize('readWrite'), async (req, res) => {

  try {
    var original = createRegistData(req.body);
    const query = 'SELECT * FROM users; SELECT * FROM typeMst;'
    const results = await pool.query(query);

    res.render('./regist/index.ejs', {
      title: 'offpay',
      users: results[0],
      types: results[1],
      moment: moment,
      original
    });
  }
  catch (err) {
    console.log(err);
  }
});

router.post('/posts/confirm', authorize('readWrite'), (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./regist/index.ejs", { title: 'offpay', errors, original });
    return;
  }
  res.render("./regist/posts/regist-confirm.ejs", { original });
});

router.post('/posts/execute', authorize('readWrite'), async (req, res) => {

  try {
    var original = createRegistData(req.body);
    var errors = validateRegistData(req.body);
    if (errors) {
      res.render("./regist/index.ejs", { title: 'offpay', errors, original });
      return;
    };
    const extractionConditionQuery = `SELECT user_id FROM users WHERE userName = ?; SELECT type_id FROM typeMst WHERE type_name = ?;`
    const extractionConditionResults = await pool.query(extractionConditionQuery, [original.user, original.type]);

    let post = {
      user_id: extractionConditionResults[0][0].user_id,
      type_id: extractionConditionResults[1][0].type_id,
      month: original.month,
      cost: original.cost,
    }

    const insertQuery = `INSERT INTO costMng SET ?;`
    await pool.query(insertQuery, post);

    res.redirect('/history');
  }
  catch (err) {
    console.log(err);
  }
});


module.exports = router;
