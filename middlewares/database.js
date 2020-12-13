
var mysql = require('mysql');

// ModelBase: Modelのベースクラス
var Database = function () {};

// Databaseクラスのインスタンスを作成する
function createClient() {
  return new Database();
};

// MySQLクライアントオブジェクトを作成する
Database.prototype._getClient = function () {
  if (this.client === undefined) {
    this.client = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Shun2887!',
      database: 'calc'
    });
  }
  return this.client;
};

// クエリを実行する
Database.prototype.query = function (query, params, callback) {
  var client = this._getClient();
  return client.query(query, params, callback);
}

// クエリを終了する
Database.prototype.end = function (callback) {
  if (this.client) {
    this.client.end(callback);
    delete this.client;
  }
}

exports.createClient = createClient;