var EventEmitter = require("events");
var CryptoJS = require("crypto-js");
var UserData = require('../../../../public/sources/user-data').getUserData();
//缓存在localStorage中的用户列表每页多少条的key
exports.localStorageUserViewPageSizeKey = 'app_user_manage.user_view.page_size';
//缓存在localStorage中的客户对应的用户列表每页多少条的key
exports.localStorageCustomerViewPageSizeKey = 'app_user_manage.customer_view.page_size';
//缓存在localStorage中的用户审计日志列表每页多少条的key
exports.localStorageLogViewPageSizeKey = 'app_user_manage.log_view.page_size';
// 审计日志和在线用户选择应用时，将应用保存到localStorage中，将当前用户user_id作为key
exports.saveSelectAppKeyUserId = JSON.stringify(UserData.user_id);

//emitter使用的事件提取常量
exports.EMITTER_CONSTANTS = {
    //回复列表滚动到最后
    REPLY_LIST_SCROLL_TO_BOTTOM : "replyListScrollToBottom"
};

//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();


//申请列表滚动条参数
exports.APPLY_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA : 150,
    BOTTOM_DELTA : 83
};
//申请详情滚动条参数
exports.APPLY_DETAIL_LAYOUT_CONSTANTS = {
    TOP_DELTA : 150,
    BOTTOM_DELTA : 102
};
//申请详情滚动条-表单
exports.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM = {
    //顶部距离
    TOP_DELTA : 150,
    //底部距离
    BOTTOM_DELTA : 100,
    //订单号高度
    ORDER_DIV_HEIGHT:47,
    //返回按钮高度
    OPERATION_BTN_HEIGHT:47
};


//加密密码
exports.encryptPassword = function(text) {
    var ciphertext = CryptoJS.AES.encrypt(text , "apply_change_password");
    return ciphertext.toString();
};
