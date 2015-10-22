/**
 * Created by Bluesky on 2015/10/16.
 * Description：基于http和https请求工具类
 */
"use strict";

var _url = require('url');
var http = require('http');
var https = require('https');
var bufferhelper = require('bufferhelper');

var request_tools = global._Request = module.exports = {};

request_tools.CONTENT_TYPES = {
    "HTML": {NAME: 'HTML', CONTENT: 'text/html'},
    "TEXT": {NAME: 'TEXT', CONTENT: 'text/plain'},
    "XML": {NAME: 'XML', CONTENT: 'text/xml'},
    "JSON": {NAME: 'JSON', CONTENT: 'application/json'},
    "JPEG": {NAME: 'JPEG', CONTENT: 'image/jpeg'},
    "FORM-URLENCODED": {NAME: 'FORM-URLENCODED', CONTENT: 'application/x-www-form-urlencoded'},
    "ENCODE": '; charset=utf-8'
};


request_tools.request = function (url, callBack, params) {
    params = params || {};
    var body = params.body || '';
    var method = params.method || 'GET';
    var xmlRoot = params.xmlRoot || 'xml';
    var httpType = params.httpType || 'http';
    var send_xml_root = params.send_xml_root || 'xml';
    var responseFormat = params.responseFormat || 'json';
    var authorization = params.authorization || '';
    var contentType = params.contentType && params.contentType.NAME || '';
    var urlObj = _url.parse(url) || {};
    var opts = {host: urlObj.hostname, method: method};
    if (urlObj.path && urlObj.path.length > 0) {
        opts.path = urlObj.path;
    }
    if (urlObj.port && urlObj.port.length > 0) {
        opts.port = urlObj.port;
    }

    var _contentType = request_tools.CONTENT_TYPES[contentType] || request_tools.CONTENT_TYPES['HTML'];
    if (!_contentType) {
        console.log('暂不支持该类型:' + contentType);
        return;
    }
    opts.headers = {'Content-Type': _contentType.CONTENT};
    if (contentType != request_tools.CONTENT_TYPES.JPEG.NAME
        && contentType != request_tools.CONTENT_TYPES['FORM-URLENCODED'].NAME) {
        opts.headers['Content-Type'] = opts.headers['Content-Type']
            + request_tools.CONTENT_TYPES.ENCODE;
    }
    if (body) {
        if (contentType == request_tools.CONTENT_TYPES['FORM-URLENCODED'].NAME) {
            opts.headers['Content-Length'] = body.length;
        } else if (typeof body === 'object'
            && contentType === request_tools.CONTENT_TYPES.XML.NAME) {
            body = utils.obj2Xml(body, send_xml_root)
        } else if (typeof body === 'object'
            && contentType === request_tools.CONTENT_TYPES.JSON.NAME) {
            body = JSON.stringify(body)
        }
    }
    if (authorization) {
        opts.headers['Authorization'] = authorization;
    }
    try {
        var reqHttp = (httpType == 'https' ? https : http);
        if (httpType == 'https') {
            if (params.rejectUnauthorized) {
                opts.rejectUnauthorized = true;
                if (params.ca) {
                    opts.ca = params.ca;
                    opts.agent = new https.Agent(opts);
                }
            } else {
                // 默认https 忽略证书验证
                opts.rejectUnauthorized = false;
            }
        }
        var req = reqHttp.request(opts, function (res) {

            var buffer_helper = new bufferhelper();
            res.on('data', function (chunk) {
                buffer_helper.concat(chunk);
            });
            res.on('end', function () {
                var data = buffer_helper.toBuffer().toString();
                var contentType = res.headers['content-type'];
                if (!contentType) {
                    contentType = params.resContentType || 'text/html; charset=utf-8';
                }
                contentType = contentType.split(';')[0];
                if (contentType == request_tools.CONTENT_TYPES.JPEG.CONTENT) {
                    callBack(null, data);//大数据要分次发
                    return;
                }
                data = new Buffer(data, 'utf8').toString('utf8');
                if ((responseFormat && responseFormat === 'JSON')
                    || contentType == request_tools.CONTENT_TYPES.JSON.CONTENT) {
                    try {
                        var jsonObj = JSON.parse(data);
                        callBack(null, jsonObj);
                    } catch (e) {
                        callBack(null, data);
                    }
                } else if ((responseFormat && responseFormat === 'XML')
                    || contentType == request_tools.CONTENT_TYPES.XML.CONTENT) {
                    utils.xml2Obj(data, xmlRoot, callBack);
                } else if ((responseFormat && responseFormat === 'HTML')
                    || contentType == request_tools.CONTENT_TYPES.HTML.CONTENT) {
                    callBack(null, data);
                } else if ((responseFormat && responseFormat === 'TEXT')
                    || contentType == request_tools.CONTENT_TYPES.TEXT.CONTENT) {
                    callBack(null, data);
                }
                else {
                    callBack(new Error('http请求返回Content-Type错误:' + res.req.path + ',Content-Type:' + contentType));
                }
            });
            res.on('error', function (err) {
                callBack(err);
            });
        });
        req.on('error', function (err) {
            callBack(err);
        });
        if (body) {
            req.write(body);
        }
        req.end();
    } catch (e) {
        callBack(e);
    }
};


var utils = {};
utils.xml2Obj = function (xmlStr, root, callBack) {
    var xmlObj = {};
    _xmlreader.read(xmlStr, function (err, result) {
        if (err) {
            return callBack(err);
        }
        var value = result[root];
        for (var key in value) {
            var obj = value[key]
            if ('text' in obj) {
                xmlObj[key] = obj.text();
            }
        }
        callBack(null, xmlObj);
    });
};

utils.obj2Xml = function (obj, root) {
    var left = '<';
    var right = '>';
    var leftEnd = '</';
    var typeHead = left + root + right;
    var typeEnd = leftEnd + root + right;
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
};



