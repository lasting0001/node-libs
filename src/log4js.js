//var express = require('express');
//var app = express();

var log4js = require('log4js');
log4js.configure(CONFIG_LOG4JS);

var logger = function () {
    var logger = log4js.getLogger('-');

    var level = 'TRACE';
    if ('production' === CONST_ENV) {
        //level = 'TRACE';
        level = 'INFO';
    }
    logger.setLevel(level);
    return logger;
}();

const SEQ = '\n';

function Log() {
    return {
        trace: function (msg) {
            logger.trace(getStack() + SEQ + msg);
        },
        debug: function (msg) {
            logger.debug(getStack() + SEQ + msg);
        },
        info: function (msg) {
            logger.info(getStack() + SEQ + msg);
        },
        warn: function (msg) {
            logger.warn(getStack() + SEQ + msg);
        },
        error: function (msg) {
            logger.error(getStack() + SEQ + msg);
        },
        fatal: function (msg) {
            logger.fatal(getStack() + SEQ + msg);
        },
        traceObj: function (msg, obj) {
            logger.trace(getStack() + SEQ + (msg || ''));
            logger.trace(obj);
        },
        errorObj: function (msg, obj) {
            logger.error(getStack() + SEQ + (msg || ''));
            logger.error(obj);
        },
        fatalObj: function (msg, obj) {
            logger.fatal(getStack() + SEQ + (msg || ''));
            logger.fatal(obj);
        }
    };
}


function getStack() {
    var sta = new Error().stack;
    if (typeof sta == 'undefined') {
        return 'no stack1';
    }
    var sts = sta.split('\n');
    if (typeof sts == 'undefined' || sts.length < 4) {
        return 'no stack2';
    }
    return sts[3].trim();
}

global._Log = Log();
