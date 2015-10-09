/**
 * Created by lijun on 15-4-20.
 */

function RanStrCreator() {
    var strAll = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var max = strAll.length;
    return function (len) {
        var token = '';
        for (var i = 0; i < len; i++) {
            token += strAll[_Utils.randomTo(max)];
        }
        return token;
    }
}

global._RanStrCreator = RanStrCreator();

function RanNumCreator() {
    var strAll = "0123456789";
    var max = strAll.length;
    return function (len) {
        var token = '';
        for (var i = 0; i < len; i++) {
            token += strAll[_Utils.randomTo(max)];
        }
        return token;
    }
}

global._RanNumCreator = RanNumCreator();


