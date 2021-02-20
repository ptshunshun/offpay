var express = require('express');
var router = express.Router();
const pool = require('../middlewares/database.js');
const moment = require('moment');
const { authorize} = require('../public/lib/accountcontorol.js');

var formData = function (body) {
  return {
    user: body.user,
    type: body.type,
    month: body.month,
    cost: body.cost,
  };
};

const sumCostParTypeQuery = "SELECT month, typeMst.type_name, SUM(cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE type_name <> '家賃' GROUP BY month, typeMst.type_id ORDER BY month, typeMst.type_id;"
const lastRentCostQuery = "SELECT cost FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE type_name = '家賃');"
const allCostInfoQuery = "SELECT costMng.seq AS id, costMng.month, users.userName, typeMst.type_name, costMng.cost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id INNER JOIN users ON users.user_id = costMng.user_id ORDER BY seq DESC;"

router.get('/', authorize('readWrite'), async (req, res, next) => {
  try {

    const sumCostParType = await pool.query(sumCostParTypeQuery);
    const lastRentCost = await pool.query(lastRentCostQuery);
    const allCostInfo = await pool.query(allCostInfoQuery);

    res.render('./history/index.ejs', {
      title: 'history',
      sumCostParType: sumCostParType,
      lastRentCost: lastRentCost[0] ? lastRentCost[0].cost : 0,
      allCostInfo: allCostInfo,
      moment: moment().format('YYYYMM')
    });
  }
  catch (err) {
    console.log(err);
  };
});

router.post(("/edit/:id"), authorize("readWrite"), async (req, res) => {
  try {
    const query = 'SELECT costMng.seq AS id, users.userName AS user, typeMst.type_name AS type, month, cost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id INNER JOIN users ON users.user_id = costMng.user_id WHERE seq = ?;'
    const results = await pool.query(query, req.params.id);
    res.render("./history/edit/edit-form.ejs", {
      title: 'edit',
      original: results[0]
    })
  }
  catch (err) {
    console.log(err);
  }
});

router.post(("/edit/execute/:id"), authorize("readWrite"), async (req, res) => {
  try {
    const selectQuery = `SELECT user_id FROM users WHERE userName = ?; SELECT type_id FROM typeMst WHERE type_name = ?`
    const updateQuery = 'UPDATE costMng SET user_id = ?, month = ?, type_id = ?, cost = ? WHERE seq = ?;'
    const selectResults = await pool.query(selectQuery, [req.body.user, req.body.type]);
    await pool.query(
      updateQuery,
      [selectResults[0][0].user_id, req.body.month, selectResults[1][0].type_id, req.body.cost, req.params.id,]
    );

    res.redirect("/history")
  }
  catch (err) {
    console.log(err);
  }
});

router.post(("/delete/confirm/:id"), authorize("readWrite"), (req, res) => {
  const original = formData(req.body)
  res.render("./history/delete/delete-confirm.ejs", {
    title: 'delete',
    original: original,
    id: req.params.id
  })
});

router.post(("/delete/execute/:id"), authorize("readWrite"), async (req, res) => {
  try {
    const deleteQuery = `DELETE FROM costMng WHERE seq = ?;`
    await pool.query(deleteQuery, req.params.id);

    res.redirect("/history")
  }
  catch (err) {
    console.log(err);
  }
});
module.exports = router;
