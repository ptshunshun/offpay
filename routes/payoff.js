var express = require('express');
var router = express.Router();
var database = require('../middlewares/database');
var db = database.createClient();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('./payoff/index.ejs', { title: 'calc' });
});

            // userごとの支払い合計金額
const query = "SELECT users.userName, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN users ON costMng.user_id = users.user_id WHERE month = ? GROUP BY users.user_id;"
　　　　　　　// 種別ごとの合計金額
            + "SELECT typeMst.type_name, SUM(costMng.cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = ? GROUP BY typeMst.type_id ORDER BY typeMst.type_id;"
            // 最後に登録した家賃情報
            + "SELECT cost FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"

router.post('/posts/execute', function(req, res, next) {
  const month = req.body.month
  db.query(
    query,
    [month, month],
    (error, results) => {
      if (error) throw error;
      const userNum = results[0].length
      const allCost = results[2][0].cost + results[1].filter(result => result["type_name"] != "家賃")
                                                  .map(result => { return result.sumCost })
                                                  .reduce((a, b) => { return a + b });
       
      const OffpayResult_parUser = results[0].map(userdata => {
        return {
          user : userdata.userName,
          cost : userdata.sumCost,
          diff : userdata.sumCost - allCost/userNum
        }
      })
      console.log(results[2].cost)

      res.render('./payoff/result.ejs', {OffpayResult_parUser, allCost, costs : results[1]})
    }
  );
});

module.exports = router;
