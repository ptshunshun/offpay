const pool = require('../../middlewares/database.js');
const _utils = require('../../public/lib/utils.js')

var data_control = exports;

//------------------------------------------------------------
data_control.execute = (sql, conditions) => {
    pool.query(sql, conditions);
};

//------------------------------------------------------------
data_control.select = (tableName, conditions) => {
    return pool.query(
        _utils.createSelectSql(tableName, conditions),
        Object.values(conditions)
    );
};

//------------------------------------------------------------
data_control.insert = (tableName, conditions) => {
    let sql = ''
    for (let i in conditions) {
        sql = sql + _utils.createInsertSql(tableName);
    }

    return pool.query(sql, conditions);
};

//------------------------------------------------------------
data_control.update = (tableName, updatedata, conditions) => {
    return pool.query(
        _utils.createUpdateSql(tableName, updatedata, conditions),
        Object.values(updatedata).concat(Object.values(conditions))
    );
};
