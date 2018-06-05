//通用错误状态码
var CommonErrorCode = require('../../../conf/errorCode/CommonErrorCode');
var logger = require('./logger').getLogger('rest');

var ErrorCode = {};
//获取错误状态码
ErrorCode.getErrorCodeDesc = function(errorObj, req) {
    var errorCodeNumber = 0, errorCodeDesc;
    var commonErrorCodeMap = CommonErrorCode.getConfigJson(req);
    if (typeof errorObj === 'string' || typeof errorObj === 'number') {
        logger.error('errorCode:' + errorObj);
        errorCodeDesc = commonErrorCodeMap[errorObj];
    } else if (errorObj instanceof Error) {
        logger.error('errorCode:rest-error, errorMessage:' + errorObj.message);
        errorCodeDesc = commonErrorCodeMap['rest-error'];
    } else if (errorObj && typeof errorObj === 'object' && (errorCodeNumber = errorObj['error_code'] || errorObj['errorCode'])) {
        errorCodeNumber = (parseInt(errorCodeNumber) || errorCodeNumber);
        logger.error('errorCode:' + errorCodeNumber);
        errorCodeDesc = commonErrorCodeMap[errorCodeNumber];
        if (!errorCodeDesc) {
            errorCodeDesc = {
                'httpCode': 'error-code-not-found',
                'message': commonErrorCodeMap['error-code-not-found'].message
            };
            logger.warn('errorCode: "' + errorCodeNumber + '", 在应用端找不到对应的描述，请尽快更新!!!');
        }
    }
    return errorCodeDesc ? errorCodeDesc : commonErrorCodeMap['default-error'];
};
/**
 *  判断是否是某个错误码.
 * @param errorObj  后台返回错误码或错误对象
 * @param errorCodeNumber  需要比对的错误码（数字）
 * @returns {boolean}
 */

ErrorCode.compareErrorCodeNumber = function(errorObj, errorCodeNumber) {
    if (!errorObj || !errorCodeNumber) {
        return false;
    } else {
        if (typeof errorObj === 'number') {
            return errorCodeNumber === errorObj;
        } else if (typeof errorObj === 'string') {
            return errorCodeNumber === parseInt(errorObj);
        } else if (typeof errorObj === 'object') {
            var codeNumber = errorObj['error_code'] || errorObj['errorCode'];
            return ErrorCode.compareErrorCodeNumber(codeNumber, errorCodeNumber);
        } else {
            return false;
        }
    }
};
module.exports = ErrorCode;