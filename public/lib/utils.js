
var _utils = exports;

//--------------------------------------------------
_utils.createSelectSql = (tableName, conditions) => {
    let columns = [];
    let conditionList = [];

    for (var key in conditions) {
        if (conditions[key] == null) continue;
        columns.push(key);
        conditionList.push(key + " = ?");
    }

    return 'SELECT (' + columns.join(",") + ' ) '
        + 'FROM ' + tableName + ' '
        + 'WHERE ' + conditionList.join(" AND ") + ';';
}

//--------------------------------------------------
_utils.createInsertSql = (tableName) => {
    return 'insert ignore into ' + tableName + ' set ?;'
};

//--------------------------------------------------
_utils.createUpdateSql = (tableName, updatedatas, conditions) => {
    let updatedatasList = [];
    let conditionsList = [];

    for (var key in updatedatas) {
        if (updatedatas[key] == null) continue;
        updatedatasList.push(key + " = ?");
    }

    for (var key in conditions) {
        if (conditions[key] == null) continue;
        conditionsList.push(key + " = ?");
    }

    return 'UPDATE ' + tableName
        + 'SET ' + updatedatasList.join(",") + ' '
        + 'WHERE ' + conditionsList.join(" AND ") + ';';
}