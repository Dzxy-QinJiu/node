/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var BusinessApplyAjax = require('../ajax/business-apply-ajax');
function BusinessApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType'
    );
    //todo 先获取需要你审批的
    this.getAllApplyList = function(queryObj) {
        this.dispatch({error: false, loading: true});
        BusinessApplyAjax.getWorklistBusinessApplyList(queryObj).then((data) => {
            this.dispatch({error: false, loading: false, data: data});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errMsg: errorMsg || Intl.get('failed.get.all.leave.apply', '获取全部出差申请失败')
            });
        });
    };
    this.getSelfApplyList = function() {
        this.dispatch({error: false, loading: true});
        BusinessApplyAjax.getSelfApplyList().then((data) => {
            this.dispatch({error: false, loading: false, data: data});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errMsg: errorMsg || Intl.get('failed.get.self.leave.apply', '获取我的出差申请失败')
            });
        });
    };
    this.getWorklistBusinessApplyList = function() {
        this.dispatch({error: false, loading: true});
        BusinessApplyAjax.getWorklistBusinessApplyList().then((data) => {
            this.dispatch({error: false, loading: false, data: data});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errMsg: errorMsg || Intl.get('failed.get.worklist.leave.apply', '获取由我审批的出差申请失败')
            });
        });
    };
}
module.exports = alt.createActions(BusinessApplyActions);