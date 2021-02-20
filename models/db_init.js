
const config = require('config');
const data_control = require('../public/lib/data_control.js');
const pool = require('../middlewares/database.js');

const db_init = exports;

const databaseName = config.databaseAuth.database;

db_init.create = async () => {

   const createTbleQuery
    = 'create table if not exists users(`user_id` int unsigned NOT NULL AUTO_INCREMENT,`userName` varchar(64) NOT NULL,`email` varchar(255) NOT NULL,`password` varchar(64) NOT NULL,`role` varchar(64) NOT NULL,PRIMARY KEY (`user_id`));'
    + 'create table if not exists costMng(`seq` int NOT NULL AUTO_INCREMENT,`user_id` int NOT NULL,`type_id` int NOT NULL,`month` varchar(6) NOT NULL,`cost` int NOT NULL,PRIMARY KEY (`seq`));'
    + 'create table if not exists typeMst(`type_id` int NOT NULL,`type_name` varchar(64) NOT NULL,PRIMARY KEY (`type_id`));'
    + 'create table if not exists privilege(`role` varchar(64) NOT NULL,`permission` varchar(64) NOT NULL,PRIMARY KEY (`role`));'

  const privilegeInsertConditions = [
    { 'role': 'default', 'permission': "read" },
    { 'role': 'owner', 'permission': "readWrite" }
  ];
  const usersInsertConditions = [
    { 'userName': 'しゅん', 'email': 'nkshn87@gmail.com', 'password': 'shun2887',  'role': 'owner'},
    { 'userName': 'ちゆ', 'email': 'mtmtcyk@gmail.com', 'password': 'chiyu2887', 'role': 'owner'}
  ];
  const typeMstInsertConditions = [
    { 'type_id': '1', 'type_name': 'スーパ' },
    { 'type_id': '2', 'type_name': '外食' },
    { 'type_id': '3', 'type_name': '日用品' },
    { 'type_id': '4', 'type_name': '家賃' },
    { 'type_id': '5', 'type_name': '電気' },
    { 'type_id': '6', 'type_name': 'ガス' },
    { 'type_id': '7', 'type_name': 'ネット' },
    { 'type_id': '8', 'type_name': 'その他' },
    { 'type_id': '9', 'type_name': '特別費' }
  ];
    try {
      await pool.query('create database if not exists ??;', databaseName);
      await pool.query('use ??', databaseName);
      await pool.query(createTbleQuery);
      await pool.query('truncate users;');
      await pool.query('truncate typeMst;');
      await data_control.insert('users', usersInsertConditions);
      await data_control.insert('typeMst', typeMstInsertConditions);
      var records = await pool.query('select * from users;');
      // pool.end();
      console.log(records);
    } catch (error) {
      console.log('db初期化に失敗しました。', error);
    };


}