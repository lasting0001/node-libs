/**
 * Created by lijun on 15-4-20.
 */

function Types() {
    return {
        COMMON_PARAM: {}

    }
}

var types = Types();

global.CONST_ENV = process.env.NODE_ENV || "development";
global.COMMON_PARAM = types.COMMON_PARAM;