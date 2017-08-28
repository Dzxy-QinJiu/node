import callRecordAjax from "../ajax/call-record-ajax";
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
function CallRecordActions() {
    this.generateActions(
        'resetState',
        'filterPhone', // 过滤电话
        'updateCallRecord',  // 添加客户后，更新对应的通话记录中的数据
        'updateCallContent', // 编辑跟进内容，更新对应的更新内容中的数据
        'toggleConfirm', // 确认对话框
        'handleRefresh', // 刷新通话记录
        'showCallAnalysisPanel' // 显示通话分析的界面
    );
    //获取通话记录列表
    this.getCallRecordList = function (params, filterObj) {
        this.dispatch({loading: true, error: false});
        let _this = this;
        callRecordAjax.getCallRecordList(params, filterObj).then(function (resData) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, result: resData});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 搜索电话号码号码时，提供推荐列表
    this.getRecommendPhoneList = function (params, filterObj) {
        callRecordAjax.getRecommendPhoneList(params, filterObj).then( (resData) => {
            this.dispatch({ error: false, resData: resData});
        },  (errMsg) => {
            this.dispatch({ error: true, errMsg: errMsg});
        });
    };
}

module.exports = alt.createActions(CallRecordActions);
