/**
 * 应用的系统公告的action
 */

var noticeAjax = require("../ajax/app-notice-ajax");
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;

function AppNoticeActions() {
    this.generateActions(
        'resetState'
    );

    //获取应用的系统公告列表
    this.getAppNoticeList = function (searchObj) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        noticeAjax.getAppNoticeList(searchObj).then(function (resData) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(AppNoticeActions);