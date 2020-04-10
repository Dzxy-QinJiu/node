var UserAjax = require('../ajax/app-user-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
/**
 * 用户审批界面使用的action
 */
function UserApplyActions() {
    this.generateActions(
        'getApplyList' //获取申请列表
        , 'paginationChange' //分页改变
        , 'changeApplyListType'//更改筛选类型
        , 'changeSearchInputValue'//修改搜索框的值
        , 'setSelectedDetailItem'//设置当前要查看详情的申请
        , 'setShowUpdateTip'//设置是否展示更新提示
        , 'changeListenScrollBottom' // 下拉加载
        , 'getApplyById'//根据id获取申请（实际是获取申请的详情）
    );
    //获取申请列表
    this.getApplyList = function(obj) {
        this.dispatch({loading: true, error: false});
        var _this = this;
        UserAjax.getApplyList(obj).then(function(data) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, data: data});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //根据id获取申请
    this.getApplyById = function(applyId) {
        this.dispatch({loading: true, error: false});
        var _this = this;
        //实际是获取详情组织申请项
        UserAjax.getApplyDetail(applyId).then(function(detail, apps) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, data: {detail: detail, apps: apps}});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //开通授权
    this.applyNewGrant = function(obj, cb) {
        UserAjax.applyNewGrant(obj).then(function(data) {
            cb(data);
        }, function(errorMsg) {
            cb(errorMsg);
        });
    };
}

module.exports = alt.createActions(UserApplyActions);
