/**
 * Created by lijun on 15-4-22.
 */

function checkType(type, caches) {
    var cache = caches[type];
    if (!cache) {
        _Log.fatal('找不到cache类型：' + type);
    }
    return cache;
}

/**
 * 运行时缓存管理
 * 注:需要在外部检测参数合法性
 * {type:{key:{time:xxx,content:XXXX}}}
 */
function Cache() {
    var fails = {};
    var caches = {};
    _Recycle.set(caches);//加入缓存回收器
    return {
        addType: function (type, cache) {
            type = type.NAME;
            solid = type.SOLID;
            if (caches[type]) {
                _Log.fatal('重复添加cache,type:' + type);
                return;
            }
            caches[type] = cache || {};
            fails[type] = 0;
            if (solid) {
                _MemSolid.add(type, caches[type]);//缓存持久化
            }
        },
        add: function (type, key, value) {
            if (!(type && key && value)) {
                return;
            }
            key += '';
            type = type.NAME;
            value.time = Date.now();
            var cache = checkType(type, caches);
            if (cache) {
                if (cache[key]) {
                    fails[type] = fails[type] + 1;
                    _Log.debug('发生cache key冲突，type:' + type + ',key:' + key);
                }
                cache[key] = value;
                if (CACHE_TYPE[type] && CACHE_TYPE[type].SOLID_CHECK && typeof value.solidCacheStatus === 'undefined') {
                    value.solidCacheStatus = SOLID_CACHE_STATUS.INSERT;
                }
            }
        },
        del: function (type, key) {
            if (!(type && key)) {
                return;
            }
            key += '';
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                cache[key] = undefined;
            }
        },
        /** 只有solid cache需要update*/
        update: function (type, value) {
            if (!(type && value)) {
                return;
            }
            type = type.NAME;
            value.time = Date.now();
            var cache = checkType(type, caches);
            if (cache) {
                if (CACHE_TYPE[type].SOLID_CHECK) {
                    value.solidCacheStatus = SOLID_CACHE_STATUS.UPDATE;
                }
            }
        },
        get: function (type, key) {
            key += '';
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                return cache[key];
            }
            return null;
        },
        getType: function (type) {
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                return cache;
            }
            return null;
        },
        getFail: function (type) {
            return fails[type.NAME] || 0;
        },
        del: function (type, key) {
            key += '';
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                cache[key] = undefined;
            }
        },
        remove: function (type) {
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                caches[type] = undefined;
            }
        },
        clear: function (type) {
            type = type.NAME;
            var cache = checkType(type, caches);
            if (cache) {
                caches[type] = {};
            }
        }
    }
}
global._Cache = Cache();


(function () {
    var CACHE_TYPE_LOCAL = CACHE_TYPE;
    for (var type in CACHE_TYPE_LOCAL) {
        var value = CACHE_TYPE_LOCAL[type];
        value.NAME = type;
        _Cache.addType(value);
    }
})();