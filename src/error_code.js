/**
 * Created by lijun on 15-4-20.
 */
function ErrorCode() {
    return {
        OK: {status: 200, code: 0},

        HEADER_ERROR: {status: 400, code: 1, error: 'Header error'},
        PARAM_ERROR: {status: 400, code: 2, error: 'Params error'},
        AUTH_ERROR: {status: 401, code: 3, error: 'Auth error'},

        INTERNAL_ERROR: {status: 500, code: 4, error: 'Internal error'},

        /** 操作失败*/
        AJAX_OPERATE_ERROR: {status: 200, code: 10701, error: 'ajax_operate_error'},
        //文件格式错误
        UPLOAD_FILE_NAME_ERROR: {status: 200, code: 10702, error: 'file name error'},
        //文件大小错误
        UPLOAD_FILE_SIZE_ERROR: {status: 200, code: 10703, error: 'file size error'},
        //渠道名称重复
        CHANNEL_NAME_ERROR: {status: 200, code: 10704, error: 'channel name has error'}
    }
}

global.ERROR_CODE = ErrorCode();