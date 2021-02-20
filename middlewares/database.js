const mysql = require('mysql');
const config = require('config');
const util = require('util');

// MySQLクライアントオブジェクトを作成する
const pool = mysql.createPool(config.databaseAuth);

// クエリを実行する
pool.query = util.promisify(pool.query); // ここでプロミス型に

module.exports = pool;

