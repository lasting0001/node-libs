/**
 * Created by lijun on 15-4-20.
 */

function Types() {
    /** 公用提前 */
    var TIME_PARAM = {
        SCAN_RECYCLE: 10000,                                        //扫描缓存对象周期
        SCAN_RECYCLE_COST: 50,                                      //扫描缓存对象耗时调试输出时间
        COMMON_VALID_TIME: 10 * 60 * 1000,                          //对象默认有效期
        PAGE_PREVIEW_LIMIT_VALID_TIME: 60 * 1000,                   //page_preview_limit_valid_time
    };
    return {
        /** 时间参数 */
        TIME_PARAM: TIME_PARAM,
        CONTENT_TYPES: {
            HTML: {NAME: 'HTML', CONTENT: 'text/html'},
            TEXT: {NAME: 'TEXT', CONTENT: 'text/plain'},
            XML: {NAME: 'XML', CONTENT: 'text/xml'},
            JSON: {NAME: 'JSON', CONTENT: 'application/json'},
            JPEG: {NAME: 'JPEG', CONTENT: 'image/jpeg'},
            'FORM-URLENCODED': {NAME: 'FORM-URLENCODED', CONTENT: 'application/x-www-form-urlencoded'},
            ENCODE: '; charset=utf-8'
        },
        CACHE_TYPE: {
        },

        COMMON_PARAM: {
            DEFAULT_DB: 'db_open_data'
        }

    }
}

var types = Types();

global.CONST_ENV = process.env.NODE_ENV || "development";
global.TIME_PARAM = types.TIME_PARAM;
global.CACHE_TYPE = types.CACHE_TYPE;
global.COMMON_PARAM = types.COMMON_PARAM;
global.CONTENT_TYPES = types.CONTENT_TYPES;
