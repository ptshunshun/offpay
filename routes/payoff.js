const express = require('express');
const router = express.Router();
const pool = require('../middlewares/database.js');
const { authorize } = require('../public/lib/accountcontorol.js')
const moment = require('moment');

/* GET users listing. */
router.get('/', authorize('readWrite'), function (req, res, next) {
  res.render('./payoff/index.ejs', {
    title: 'offpay',
    moment: moment
  });
});

router.post('/posts/execute', authorize('readWrite'), async (req, res, next) => {
  try {
    const month = req.body.month;
    // userごとの支払い合計金額
    const perUserQuery = "SELECT users.user_id, users.userName, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN users ON costMng.user_id = users.user_id WHERE month = ? GROUP BY users.user_id;"
    // 種別ごとの合計金額
    const perTypeQuery = "SELECT typeMst.type_id, typeMst.type_name, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = ? GROUP BY typeMst.type_id ORDER BY typeMst.type_id;"
    // 最後に登録した家賃情報
    const lastRentQuery = "SELECT type_id, '家賃' AS type_name, cost AS sumCost, user_id FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"

    const perUserCost = await pool.query(perUserQuery, month);
    const perTypeCost = await pool.query(perTypeQuery, month);
    const lastRentCost = await pool.query(lastRentQuery);

    if (perUserCost.length === 0) {
      res.render('./payoff/result.ejs', { OffpayResult_parUser: [], allCost: 0, costs: [] })
    } else {
      const userNum = perUserCost.length
      const costs = perTypeCost.filter(result => result["type_name"] != "家賃")

      let rentUser_id = '';
      // 過去に一度でも家賃を払っているなら
      if (lastRentCost.length !== 0) {
        costs.push(lastRentCost[0])       // 最後に登録した家賃を足す(毎月同じ値段を書かなくてもいいように)
        rentUser_id = lastRentCost[0].user_id; // 家賃担当者のidを取得
      }

      const allCost = costs.map(cost => { return cost.sumCost })
        .reduce((a, b) => a + b, 0);

      const OffpayResult_parUser = perUserCost.map(userdata => {
        const cost = userdata.sumCost
        return {
          user: userdata.userName,
          cost: cost,
          diff: cost - allCost / userNum
        }
      })

      // 食費を計算
      const foodExpensescosts = costs.filter(cost => ["スーパ", "外食"].includes(cost.type_name))
        .map(cost => cost.sumCost)
        .reduce((a, b) => a + b, 0);

      costs.unshift({ type_name: "食費", sumCost: foodExpensescosts }); // 先頭に追加

      res.render('./payoff/result.ejs', { OffpayResult_parUser, allCost, costs })

    }
  }
  catch (err) {
    console.log(err);
  }
});

module.exports = router;
