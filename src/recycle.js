/**
 * Created by lijun on 15-4-22.
 */

//TODO cache count control
//失效属性内存回收
function Recycle() {
    var caches = {};
    var scan = function Scan() {
        var CACHE_TYPE_LOCAL = CACHE_TYPE;
        var TIME_PARAM_LOCAL = TIME_PARAM;
        return setInterval(function () {
            var st = Date.now();
            for (var type in caches) {
                if (!CACHE_TYPE_LOCAL[type]) {
                    continue;
                }
                if (!CACHE_TYPE_LOCAL[type].VALID_CHECK) {
                    continue;
                }
                var validTime = CACHE_TYPE_LOCAL[type] && CACHE_TYPE_LOCAL[type].RECYCLE_TIME || TIME_PARAM_LOCAL.COMMON_VALID_TIME || 0;
                if (!validTime) {
                    continue;
                }
                var cache = caches[type];
                if (cache) {
                    for (var key in cache) {
                        var value = cache[key];
                        if (value && value.time && (value.time + validTime < Date.now())) {
                            cache[key] = undefined;
                            _Log.trace('Recycle删除type:' + type + ',key:' + key);
                        }
                    }
                }
            }
            var ct = Date.now() - st;
            if (ct > TIME_PARAM_LOCAL.SCAN_RECYCLE_COST)
                _Log.warn('Recycle 耗时：' + ct + 'ms');
        }, TIME_PARAM.SCAN_RECYCLE);
    };
    var interval = scan();
    return {
        set: function (value) {
            caches = value;
        },
        stop: function () {
            clearInterval(interval);
        },
        start: function () {
            scan();
        }
    }
};
global._Recycle = Recycle();