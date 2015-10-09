/**
 * Created by lijun on 15-5-4.
 */

//var _iconvLite = require('iconv-lite');
//_iconvLite.extendNodeEncodings();// 扩展系统编码

var _util = require('util');

//系统库函数的扩展
String.prototype.deleteCharAt = function (index) {
    var str = this + '';
    if (index < 0 || index > str.length) {
        return this;
    }
    return str.slice(0, index) + str.slice(index + 1);
};

//20150808121205(yyyyMMddhhmmss)
String.prototype.toDate = function () {
    var str = this + '';
    if (!isNaN(str)) {
        return new Date(str.substr(0, 4) || 0, parseInt(str.substr(4, 2) || 0) - 1, str.substr(6, 2) || 0, str.substr(8, 2) || 0, str.substr(10, 2) || 0)
    }
};

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

Date.prototype.addDate = function (count) {
    if (!isNaN(count)) {
        this.setDate(this.getDate() + count);
        return this;
    }
};

Date.prototype.clone = function () {
    return new Date(this);
};

// 静态
Date.checkValid = function (date) {
    if (date && !isNaN(new Date(date).getTime())) {
        return true;
    }
    return false;
};

String.prototype.containsIgnoreCase = function (str) {
    if (str && (this + '').match(new RegExp(str, 'i'))) {
        return true;
    }
    return false;
};

String.prototype.equalsIgnoreCase = function (str) {
    if (str && (this + '').match(new RegExp('^' + str + '$', 'i'))) {
        return true;
    }
    return false;
};

//String.prototype.toGbk = function () {
//    return _iconvLite.encode(this, 'gbk');
//};

// 参数不能为空
String.prototype.replaceAll = function (find, rep) {
    return (this + '').replace(new RegExp(find, 'gm'), rep);
};

// 对于本身就有DATE_FORMAT(date,"%Y-%m-%d")的语句，切参数个数大于1的不兼容
String.prototype.format = function () {
    var str = this + '';
    var repls = arguments;
    if (repls.length > 0 && Array.isArray(repls[0])) {
        repls = repls[0];
    }
    for (var i = 0; i < repls.length; i++) {
        var value = repls[i];
        if (typeof value === 'string' || typeof value === 'number') {
            str = _util.format(str, value);
        }
    }
    return str;
};

String.prototype.containsChinese = function () {
    var str = this;
    var pattern = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    if (!pattern.exec(str)) {
        return false;
    } else {
        return true;
    }
};

//Object.prototype.equals = function 。。。会影响到其他的

function Extension() {

}
//obj1中的key-value是否都与obj2相等，obj2可以有额外key-value
Extension.prototype.objEquals = function (obj1, obj2) {
    for (var key in obj1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};
//obj2的key是否都存在于obj1
Extension.prototype.objContains = function (obj1, obj2) {
    for (var key in obj2) {
        if (obj1[key] === undefined) {
            return false;
        }
    }
    return true;
};

global._Extension = new Extension();
