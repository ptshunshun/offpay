var express = require('express');
var router = express.Router();
var database = require('../middlewares/database');
var db = database.createClient();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('./payoff/index.ejs', { title: 'calc' });
});

            // userごとの支払い合計金額
const query = "SELECT users.user_id, users.userName, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN users ON costMng.user_id = users.user_id WHERE month = ? GROUP BY users.user_id;"
　　　　　　　// 種別ごとの合計金額
            + "SELECT typeMst.type_id, typeMst.type_name, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = ? GROUP BY typeMst.type_id ORDER BY typeMst.type_id;"
            // 最後に登録した家賃情報
            + "SELECT type_id, '家賃' AS type_name, cost AS sumCost, user_id FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"

router.post('/posts/execute', function(req, res, next) {
  const month = req.body.month
  db.query(
    query,
    [month, month],
    (error, results) => {
      if (error) throw error;
      const userNum = results[0].length
      const costs = results[1].filter(result => result["type_name"] != "家賃")
      if (results[2].length > 0) {costs.push(results[2][0])}; 　// 最後に登録した家賃を足す(あれば)
      const user_id = results[2][0].user_id
      const allCost = costs.map(result => { return result.sumCost })
                                .reduce((a, b) => a + b , 0);

      const OffpayResult_parUser = results[0].map(userdata => {
        const cost = userdata.sumCost + ((userdata.user_id == user_id) ? results[2][0].sumCost : 0)
        return {
          user : userdata.userName,
          cost : cost,
          diff : cost - allCost/userNum
        }
      })

      res.render('./payoff/result.ejs', {OffpayResult_parUser, allCost, costs : costs})
    }
  );
});

module.exports = router;
