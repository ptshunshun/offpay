var express = require('express');
var router = express.Router();
const database = require('../middlewares/database');
const db = database.createClient();
const moment = require('moment');

const query = "SELECT typeMst.type_name, SUM(cost) AS sumCost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id WHERE month = DATE_FORMAT(curdate(), '%Y%m') GROUP BY typeMst.type_id ORDER BY typeMst.type_id;"
            + "SELECT * FROM users;"
            + "SELECT * FROM typeMst ORDER BY type_id;"
            // 最後に登録した家賃情報
            + "SELECT cost FROM costMng WHERE seq = (SELECT MAX(seq) FROM costMng WHERE type_id = 4);"
            + "SELECT costMng.month, typeMst.type_name, costMng.cost FROM costMng INNER JOIN typeMst ON costMng.type_id = typeMst.type_id;"
router.get('/', function(req, res, next) {
  db.query(
    query,
    (error, results) => {
      if (error) throw error;
      const typeList = results[0].filter(result => result["type_name"] != "家賃")
                                 .map(result => result["type_name"])
                                 typeList.push("家賃")
      const costList = results[0].filter(result => result["type_name"] != "家賃")
                                  .map(result => result["sumCost"])
                                  costList.push(results[3][0].cost) //最後に登録した家賃情報追加
      res.render('./history/index.ejs', { 
        title: 'calc',
        typeList : typeList,
        costList : costList,
        users : results[1],
        types : results[2],
        listAll : results[4],
        moment : moment
      });
      console.log(results[4][0].month)
      console.log(costList)
      const parMonthList = results[4].filter(v => v.month == "202011")
      console.log(parMonthList)

    }
  )
});

module.exports = router;
  