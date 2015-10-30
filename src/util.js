/**
 * Created by lijun on 15-4-15.
 */

var _md5 = require('MD5');
var _xmlreader = require("xmlreader");


var Util = function () {
    var strAll0 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var max0 = strAll0.length;
    var strAll1 = "0123456789";
    var max1 = strAll1.length;
    return {
        random: function (min, max) {
            var c = max - min;
            return Math.floor(Math.random() * c + min);
        },
        randomTo: function (max) {
            return Math.floor(Math.random() * max);
        },
        ranStr: function (len) {
            var token = '';
            for (var i = 0; i < len; i++) {
                token += strAll0[_Utils.randomTo(max0)];
            }
            return token;
        },
        ranNum: function (len) {
            var token = '';
            for (var i = 0; i < len; i++) {
                token += strAll1[_Utils.randomTo(max1)];
            }
            return token;
        },
        md5: function (input) {
            return _md5(input);
        },
        obj2Xml: function (obj, type) {
            var left = '<';
            var right = '>';
            var leftEnd = '</';
            var typeHead = left + type + right;
            var typeEnd = leftEnd + type + right;
            var xmlHead = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>';
            var content = xmlHead + typeHead;
            for (var key in obj) {
                content += left;
                content += key;
                content += right;
                content += obj[key];
                content += leftEnd;
                content += key;
                content += right;
            }
            content += typeEnd;
            return content;
        },
        xml2Obj: function (xmlStr, type, callBack) {
            var xmlObj = {};
            _xmlreader.read(xmlStr, function (err, result) {
                if (err) {
                    return callBack(err);
                }
                var value = result[type];
                for (var key in value) {
                    var obj = value[key]
                    if ('text' in obj) {
                        xmlObj[key] = obj.text();
                    }
                }
                callBack(null, xmlObj);
            });
        },
        getClientIp: function (req) {
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress || 'unknown ip';
        },
        isApp: function (req) {
            var userAgent = req.get('user-agent') || '';
            var regx = /.*5miao_game.*/;
            if (userAgent.match(regx)) {
                return true;
            }
            return false;
        },
        getRedisTokenTey: function (uid) {
            return "user:" + uid + ":token";
        },
        // 自定义cookie必须在最前面
        setCookieAndStore: function (res, cookie, params, callBack) {
            var cookieArr = [];
            cookie.forEach(function (e) {
                var cookieStr = '';
                for (var key in e) {
                    if (key === 'secure' || key === 'httponly') {
                        cookieStr += key;
                        cookieStr += ';';
                    } else {
                        cookieStr += key;
                        cookieStr += '=';
                        cookieStr += e[key];
                        cookieStr += ';';
                    }
                }
                if (cookieStr.length > 0) {
                    cookieStr = cookieStr.deleteCharAt(cookieStr.length - 1);
                }
                cookieArr.push(cookieStr);
            });
            var headObj = {
                'Set-Cookie': cookieArr,
                'Content-Type': 'text/html'
            };
            if (params && params.status == 302 && params.reUrl) {
                headObj['Location'] = params.reUrl;
            }
            res.writeHead(params && params.status || 200, headObj);
            if (params && params.redis) {
                _Redis.set(params.redis.redis_key, params.redis.redis_value, function (err, resp) {
                    if (err || !resp) {
                        return _Log.error('cookie 信息存储到redis出错：' + err);
                    }
                    _Redis.expire(params.redis.redis_key, params.redis.redis_expires, function (err, resp) {
                        if (err || !resp) {
                            return _Log.error('cookie 信息存储到redis成功，设置有效期出错：' + err);
                        }
                        callBack && callBack();
                    });
                });
            }
        },
        getCookie: function (req, key) {
            var cookies = req.cookies || {};
            var json = cookies[key];
            if (json) {
                try {
                    json = JSON.parse(json);
                }
                catch (e) {
                }
            }
            return json;
        },
        pageParamInit: function (req, default_page_size, max_page_size) {
            var query = req.query;
            var page_index = parseInt(query.page_index);
            var page_size = parseInt(query.page_size);
            if (isNaN(page_index) || page_index < 0) {
                page_index = 0;
            }
            if (isNaN(page_size) || page_size < 0 || page_size > (max_page_size || 50)) {
                page_size = (default_page_size || 10);
            }
            query.page_index = page_index;
            query.page_size = page_size;
            req._index_st = page_index * page_size;
            req._index_ed = page_size;
        },
        clearCookieAndDelRedis: function (user_id, res, params) {
            var auth_key = SELF_FUNC.encodeAuthValue(user_id);
            _Redis.del(auth_key, '', function (err, resp) {
                if (err) {
                    return _Log.errorObj('redis del 出错：', err);
                }
                var cookie = {};
                cookie[SELF_PARAM.OPEN_COOKIE_KEY] = '';
                cookie['Max-Age'] = -1;
                cookie['httponly'] = '';
                _Utils.setCookieAndStore(res, [cookie], params);
                res.end('{"code":0}');
            });
        },
        // 必须要在一个独立的use里面
        checkAndInfoPartnerAndChannel: function (req) {
            if (CONST_ENV !== 'development' && (!req.query.partner_id || !req.query.channel_id || isNaN(req.query.partner_id) || isNaN(req.query.channel_id))) {
                _Log.fatal('nginx解析Id错误 query：' + JSON.stringify(req.query));
                req.query.partner_id = 28;
                req.query.channel_id = 40;
            }
            var partner_id = req.query.partner_id = parseInt(req.query.partner_id);
            var channel_id = req.query.channel_id = parseInt(req.query.channel_id);
            _RocketPieceCache.getPiece(CACHE_PIECE_TYPE.PARTNER_INFO_BY_ID, [partner_id], function (result) {
                if (result) {
                    result = result[0];
                    req._partner_id = partner_id;
                    req._channel_id = channel_id;
                    req._is_private = result.is_private;
                    return next();
                }
                return _BackClient(res)(ERROR_CODE.AUTH_ERROR, '该平台不存在~');
            });
        }
    };
};

global._Utils = Util();

function BackClient(res) {
    return function (err, result) {
        if (err) {
            var json = {code: err.code, error: err.error};
            if (result) {
                json.msg = result;
            }
            res.status(err.status).json(json);
        } else {
            if (!result) {
                result = {};
            }
            if (Array.isArray(result)) {
                result = {arr: result};
            }
            result.code = 0;
            res.status(200).json(result);
        }
    };
}

global._BackClient = BackClient;