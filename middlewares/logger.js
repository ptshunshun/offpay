const log4js = require('log4js');
const config = require('config');

/*
指定できるログレベル
logger.system.trace('trace');
logger.system.debug('debug');
logger.system.info('info');
logger.system.warn('warn');
logger.system.error('error');
logger.system.fatal('fatal');
*/

// 60秒ごとにリロード
log4js.configure(config.log4js, { reloadSecs: 60 });

// ログレベルの設定
const logger = log4js.getLogger();
logger.level = config.log_level;

module.exports = {
    system: logger,
    express: log4js.connectLogger(log4js.getLogger('express'), {level: log4js.levels.INFO}),
};
