const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../public/lib/accountcontorol.js')
const pool = require('../middlewares/database.js');

const query = "SELECT typeMst.type_name, SUM(cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = DATE_FORMAT(curdate(), '%Y%m') GROUP BY typeMst.type_name;"
  + "SELECT * FROM users;"
  + "SELECT * FROM typeMst;"
  // 最後に登録した家賃情報
  + "SELECT cost FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"
// router.get('/index', authorize('readWrite'), async (req, res, next) => {
//   try {
//     const results = await pool.query(query);
//     const typeList = results[0].filter(result => result["type_name"] != "家賃")
//       .map(result => result["type_name"])
//     typeList.push("家賃")
//     const costList = results[0].filter(result => result["type_name"] != "家賃")
//       .map(result => result["sumCost"])
//     if (results[3].length > 0) {
//       costList.push(results[3][0].cost) //最後に登録した家賃情報追加
//     }

//     res.render('./auth/index.ejs', {
//       title: 'offpay',
//       typeList: typeList,
//       costList: costList,
//       users: results[1],
//       types: results[2]
//     });
//   }
//   catch (err) {
//     console.log(err);
//   };
// });

router.get('/profile', authorize('readWrite'), async(req, res, next) => {

  const userInfo = await pool.query('SELECT * FROM users WHERE email = ?;', req.user[0].email);
  if (!userInfo) {
    console.log('user情報がありません');
    res.redirect('/auth/login');
  };

  const userData = {
    user: userInfo[0].userName,
    email: userInfo[0].email,
    password: userInfo[0].password
  }

  res.render('./auth/profile.ejs', {
    title: 'profile',
    original: userData
  })
});

router.get("/login", (req, res) => {
  res.render("./auth/login.ejs", { message: req.flash("message") });
});

router.post("/login", authenticate());

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;
