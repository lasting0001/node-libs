/**
 * Created by lijun on 15-4-17.
 */

var fs = require('fs');

function Config() {
    var configs = JSON.parse(fs.readFileSync(__dirname + '/../config/config.json'));
    return function (key) {
        return configs[key];
    }
}

var config = Config();
global.CONFIG_MYSQL = {};
(function () {
    var mysqlConfig = config('mysql');
    for (var key in mysqlConfig) {
        CONFIG_MYSQL[key] = mysqlConfig[key][CONST_ENV];
        CONFIG_MYSQL[key].NAME = key;
    }
})();

global.CONFIG_LOG4JS = config('log4js')[CONST_ENV];
global.CONFIG_REDIS = config('redis')[CONST_ENV];