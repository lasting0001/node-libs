'use strict';
/**
 * Created by lijun on 15-4-24.
 */
var _url = require('url');
var http = require('http');
var https = require('https');


function Request() {
    return {
        request: function (url, callBack, params) {
            params = params || {};
            params.body = params.body || '';
            params.method = params.method || 'GET';
            params.xmlRoot = params.xmlRoot || '';
            params.httpType = params.httpType || '';
            params.responseFormat = params.responseFormat || '';
            params.contentType = params.contentType || CONTENT_TYPES['HTML'];
            var urlObj = _url.parse(url) || {};
            var opts = {host: urlObj.hostname, method: params.method};
            if (urlObj.path && urlObj.path.length > 0) {
                opts.path = encodeURIComponent(urlObj.path);
            }
            if (urlObj.port && urlObj.port.length > 0) {
                opts.port = urlObj.port;
            }

            var body = params.body;
            var xmlRoot = params.xmlRoot;
            var httpType = params.httpType;
            var contentType = params.contentType.NAME;
            var responseFormat = params.responseFormat;

            var _contentType = CONTENT_TYPES[contentType];
            if (!_contentType) {
                _Log.error('暂不支持该类型:' + contentType);
                return;
            }
            opts.headers = {'Content-Type': _contentType.CONTENT};
            if (contentType != CONTENT_TYPES.JPEG.NAME && contentType != CONTENT_TYPES['FORM-URLENCODED'].NAME) {
                opts.headers['Content-Type'] = opts.headers['Content-Type'] + CONTENT_TYPES.ENCODE;
            }
            if (body && contentType == CONTENT_TYPES['FORM-URLENCODED'].NAME) {
                opts.headers['Content-Length'] = body.length;
            }
            try {
                var reqHttp = (httpType == 'https' ? https : http);
                var req = reqHttp.request(opts, function (res) {
                    res.on('data', function (chunk) {
                        var contentType = res.headers['content-type'];
                        if (!contentType) {
                            callBack(new Error('http请求返回错误:' + res.req.path));
                            return;
                        }
                        contentType = contentType.split(';')[0].trim();
                        if (contentType == CONTENT_TYPES.JPEG.CONTENT) {
                            callBack(null, chunk);//大数据要分次发
                            return;
                        }
                        var data = new Buffer(chunk, 'utf8').toString('utf8');
                        if ((responseFormat && responseFormat === 'JSON') || contentType == CONTENT_TYPES.JSON.CONTENT) {
                            callBack(null, JSON.parse(data));
                        } else if ((responseFormat && responseFormat === 'XML') || contentType == CONTENT_TYPES.XML.CONTENT) {
                            _Utils.xml2Obj(data, xmlRoot, callBack);
                        } else if ((responseFormat && responseFormat === 'HTML') || contentType == CONTENT_TYPES.HTML.CONTENT) {
                            callBack(null, data);
                        } else if ((responseFormat && responseFormat === 'TEXT') || contentType == CONTENT_TYPES.TEXT.CONTENT) {
                            try {
                                var jsonObj = JSON.parse(data);
                                callBack(null, jsonObj);
                            } catch (e) {
                                callBack(null, data);
                            }
                        }
                        else {
                            callBack(new Error('http请求返回Content-Type错误:' + res.req.path + ',Content-Type:' + contentType));
                        }
                    });
                    res.on('error', function (err) {
                        callBack(err);
                    })
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
        }
    }
}

global._Request = Request();