/**
 * Created by lijun on 15-5-21.
 */

function DirectSolid() {
    return function (sql, callBack, opts) {
        opts = opts || {};
        callBack = callBack || function (results, params) {
                _Log.fatal('_DirectSolid 无回调方法sql：' + sql);
            };
        opts.type = opts.type || 'SELECT';
        _Utils.dbQuery(sql, callBack, opts);
    }
}

global._DirectSolid = DirectSolid();

function BatchSQL() {
    return function (sqls, callBack, params) {
        if (!sqls || !Array.isArray(sqls) || sqls.length == 0) {
            return callBack(null);
        }
        params = params || {};
        var columns = params.columns || [];
        if (columns.length.length > 0 && columns.length !== sqls.length) {
            _Log.error('columns len != sqls len');
            return callBack(null);
        }
        var dbPoolName = params.dbPoolName || COMMON_PARAM.DEFAULT_DB;
        callBack = callBack || function (results, params) {
            };
        //_GetConnection(dbPoolName).(function (err, conn) {
        //    if (err) {
        //        return console.error(err) & callBack(null);
        //    }
        var conn = _GetConnection(dbPoolName);
        conn.beginTransaction(function (err) {
            if (err) {
                conn.destroy();
                _Log.errorObj('beginTransaction', err);
                return callBack(null);
            }
            for (var i = 0, len = sqls.length; i < len; i++) {
                if (conn.destroyed) {
                    break;
                }
                conn.query(sqls[i], columns[i] || [], function (err, results) {
                    if (err) {
                        conn.rollback();
                        conn.destroy();
                        _Log.errorObj('query', err);
                        callBack(null);
                    }
                });
            }
            conn.destroyed || conn.commit(function (err) {
                if (err) {
                    conn.rollback();
                    conn.destroy();
                    _Log.errorObj('commit', err);
                    return callBack(null);
                }
                conn.destroy();
                callBack(true);
            });
        });
        //});
    }
}

global._BatchSQL = BatchSQL();


function OneSQLBatchParams() {
    return function (sql, callBack, params) {
        if (!sql || sql.length == 0) {
            return callBack(null);
        }
        params = params || {};
        var columns = params.columns;
        if (!columns) {
            _Log.error('columns null');
            return callBack(null);
        }
        var dbPoolName = params.dbPoolName || COMMON_PARAM.DEFAULT_DB;
        callBack = callBack || function (results, params) {
            };
        var conn = _GetConnection(dbPoolName);
        conn.beginTransaction(function (err) {
            if (err) {
                conn.destroy();
                _Log.errorObj('beginTransaction', err);
                return callBack(null);
            }
            for (var i = 0, len = columns.length; i < len; i++) {
                if (conn.destroyed) {
                    break;
                }
                conn.query(sql, columns[i] || [], function (err, results) {
                    if (err) {
                        conn.rollback();
                        conn.destroy();
                        _Log.errorObj('query', err);
                        callBack(null);
                    }
                });
            }
            conn.destroyed || conn.commit(function (err) {
                if (err) {
                    conn.rollback();
                    conn.destroy();
                    _Log.errorObj('commit', err);
                    return callBack(null);
                }
                conn.destroy();
                callBack(true);
            });
        });
        //});
    }
}

global._OneSQLBatchParams = OneSQLBatchParams();