var express = require('express');
var router = express.Router();
const database = require('../middlewares/database');
const db = database.createClient();

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

router.get("/", (req, res) => {
  db.query(
    'SELECT * FROM users; SELECT * FROM typeMst;',
    (error, results) => {
      if (error) throw error;
      // const type_names =results.fillter(packet => packet[type_name])
      res.render('./regist/index.ejs', { 
        title: 'calc',
        users : results[0],
        types : results[1]
      });
    }
  )
});

router.post('/input', (req, res) => {
  var original = createRegistData(req.body);
  db.query(
    'SELECT * FROM users; SELECT * FROM typeMst;',
    (error, results) => {
      if (error) throw error;
      // const type_names =results.fillter(packet => packet[type_name])
      res.render('./regist/index.ejs', { 
        title : 'calc',
        users : results[0],
        types : results[1],
        original
      });
    }
  )
});

router.post('/posts/confirm', (req, res)　=> {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./regist/index.ejs", { title: 'calc' , errors, original });
    return;
  }
  res.render("./regist/posts/regist-confirm.ejs", { original });
});

router.post('/posts/execute', async (req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./regist/index.ejs", { title: 'calc' , errors, original });
    return;    
  };
  var post = {
    user_id : null,
    type_id : null,
    month : null,
    cost : null,
  }
  db.query(
    `SELECT user_id FROM users WHERE userName = ?; SELECT type_id FROM typeMst WHERE type_name = ?;`,
    [original.user, original.type],
    (error, results) => {
      if(error) throw error;
      post = {
        user_id : results[0][0].user_id,
        type_id : results[1][0].type_id,
        month : original.month,
        cost : original.cost,
      }
      db.query(
        `INSERT INTO costMng SET ?;`,
        post,
        (error, results) => {
          if (error) throw error;
          res.redirect('/');
          console.log('ID:', results.insertId);
        }
      )
    }
  )
});


module.exports = router;
