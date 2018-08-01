/**
 * 验证规则
 * */

// 数字验证规则
exports.getNumberValidateRule = function() {
    return {pattern: /^(\d|,)+(\.\d+)?$/, message: Intl.get('contract.45', '请填写数字')};
};