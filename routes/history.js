var express = require('express');
var router = express.Router();
const database = require('../middlewares/database');
const db = database.createClient();
const moment = require('moment');
console.log('aaa');
var updateEditData = function (body) {
  return {
    user: body.user,
    type: body.type,
    month: body.month,
    cost: body.cost,
  };
};

const query = "SELECT month, typeMst.type_name, SUM(cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = ? GROUP BY month, typeMst.type_id ORDER BY month, typeMst.type_id;"
            + "SELECT * FROM users;"
            + "SELECT * FROM typeMst ORDER BY type_id;"
            // 最後に登録した家賃情報
            + "SELECT cost FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"
            + "SELECT costMng.seq AS id, costMng.month, users.userName, typeMst.type_name, costMng.cost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id INNER JOIN users ON users.user_id = costMng.user_id ORDER BY seq DESC;"
router.get('/', function(req, res, next) {
  var selectMonth = req.body.month
  selectMonth = "202101";
  db.query(
    query,
    selectMonth,
    (error, results) => {
      if (error) throw error;
      const dic_type = {}
      const list_type = []
      const typeList = results[0].filter(result => result["type_name"] != "家賃")
                                 .map(result => result["type_name"])
      console.log(typeList);
      console.log(results[0].filter(result => result["type_name"] != "家賃"));
                                //  typeList.push("家賃")
      const costList = results[0].filter(result => result["type_name"] != "家賃")
                                  .map(result => result["sumCost"])
                                  costList.push(results[3][0].cost); //最後に登録した家賃情報追加
      res.render('./history/index.ejs', { 
        title: 'history',
        typeList : typeList,
        costList : costList,
        users : results[1],
        types : results[2],
        listAll : results[4],
        moment : moment
      });
      console.log(results[4])
      
    }
  )
});

router.post(("/edit/:id"), (req, res) => {
  db.query(
    'SELECT costMng.seq AS id, users.userName AS user, typeMst.type_name AS type, month, cost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id INNER JOIN users ON users.user_id = costMng.user_id WHERE seq = ?;',
    req.params.id,
    (error, results) => {
      res.render("./history/edit/edit-form.ejs", {
        title : 'edit',
        original :results[0]
      })
    }
    )
});

router.post(("/edit/confirm/:id"), (req, res) => {
  updateEditData = req.body
  res.render("./history/edit/edit-confirm.ejs", {
    title : 'edit',
    original :updateEditData,
    id : req.params.id
  })
});

router.post(("/edit/execute/:id"), (req, res) => {
  db.query(
    `SELECT user_id FROM users WHERE userName = ?; SELECT type_id FROM typeMst WHERE type_name = ?`,
    [req.body.user, req.body.type],
    (error, results) => {
      if (error) throw error;
      db.query (
        'UPDATE costMng SET user_id = ?, month = ?, type_id = ?, cost = ? WHERE seq = ?;',
        [results[0][0].user_id, req.body.month, results[1][0].type_id, req.body.cost, req.params.id,],
        (error, results) => {
          console.log(req.params.id)
          res.redirect("/history")
        }
      )
    }
  )
});

module.exports = router;
  